import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import { createMessageService } from "./controllers/message.controller.js";
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    ca: [fs.readFileSync(path.resolve(process.env.KAFKA_SSL_CA_PATH), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
    mechanism: "plain",
  },
  idempotent: true,
});

let producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message) {
  const producer = await createProducer();
  
  await producer.send({
    messages: [{ key: message["groupId"], value: message }],
    topic: "MESSAGES",
  });
 
  return true;
}


export async function startMessageConsumer(groupId) {

  const consumer = kafka.consumer({ groupId: groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  await consumer.run({
    autoCommit: false, // Disable auto-commit
    eachMessage: async ({ message, pause, commitOffsets }) => {
      if (!message) return;
  
      try {
        const messageContent = JSON.parse(message.value.toString());
        
        // Check for duplicates before processing
        const isDuplicate = await checkForDuplicateMessage(messageContent);
        if (isDuplicate) {
          console.log("Duplicate message detected, skipping...");
          return;
        }
  
        await createMessageService({
          message: messageContent.message,
          createdBy: messageContent.createdBy,
          groupId: messageContent.groupId
        });
  
        // Manually commit the offset after successful processing
        await commitOffsets([{ topic: message.topic, partition: message.partition, offset: message.offset }]);
  
      } catch (err) {
        console.error("Error processing message:", err);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    }
  });
}
export default kafka;