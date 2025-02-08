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
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      
      if (!message) return;
    
    
    
      try {
        // Save the message to the database with relevant fields
        const messageContent = JSON.parse(message.value.toString());
      
        await createMessageService({
          message: messageContent.message,
          createdBy: messageContent.createdBy,
          groupId: messageContent.groupId
        });
       
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