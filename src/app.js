// import cors from "cors";
// import express from "express";
// import { Server as SocketIOServer } from "socket.io";
// import http from "http";
// import Redis from "ioredis";
// import { produceMessage,startMessageConsumer } from "./kafks.js";

// const app = express();
// const server = http.createServer(app);

// const redisOptions = {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     retryStrategy: (times) => {
//         return 5000; // Reconnect after 5 seconds
//     },
// };

// const pub = new Redis(redisOptions);
// const sub = new Redis(redisOptions);

// pub.on("error", (err) => {
//     console.error("Redis Pub Error:", err);
// });

// sub.on("error", (err) => {
//     console.error("Redis Sub Error:", err);
// });

// // Configure CORS for Socket.IO
// const io = new SocketIOServer(server, {
//     cors: {
//         origin: "*", // Allow all origins (or specify allowed origins)
//         methods: ["GET", "POST"],
//     },
// });

// const clients = {};

// // Subscribe to Redis channels

// io.on("connection", (socket) => {
//     console.log("Connected:", socket.id);

   
//     socket.on("Id", (data) => {
        
    
//         const { userId, groupId } = data; // Extract values safely
    
        
    
//         if (!userId || !groupId) {
//             console.error("Invalid userId or groupId received.");
//             return; // Stop execution if data is missing
//         }
    
//         if (!clients[userId]) {
//             clients[userId] = [];
//         }
//         clients[userId].push(socket);
    
//         startMessageConsumer(groupId).catch(console.error);
    
//         console.log(`User ${userId} registered in group ${groupId}.`);
//     });

//     socket.on("disconnect", () => {
//         Object.keys(clients).forEach((userId) => {
//             clients[userId] = clients[userId].filter((s) => s !== socket);
//             if (clients[userId].length === 0) {
//                 delete clients[userId];
//             }
//         });
//         console.log(`User disconnected: ${socket.id}`);
//     });

//     socket.on("messageEvent", async (msg) => {
        
//         const { groupId } = msg;
//         // Publish the message to the Redis channel named after the groupId
//         pub.publish(groupId, JSON.stringify(msg));
        
//         // Ensure the subscriber is subscribed to the groupId channel
//         sub.subscribe(groupId, (err) => {
//             if (err) {
//                 console.error(`Subscription error for ${groupId}:`, err);
//             } else {
//                 console.log(`Subscribed to Redis channel: ${groupId}`);
//             }
//         });
//     });
// });

// // Handle messages from Redis
// sub.on('message', async(channel, message) => {
    
//     const parsedMessage = JSON.parse(message);
//     await produceMessage(message);
//     const { userList, message: msg, createdBy, groupId } = parsedMessage;

//     // Forward the message to all users in the group except the sender
//     userList.forEach((userId) => {
//         if (
//             // userId !== createdBy && 
//             clients[userId]) {
//             clients[userId].forEach((socket) => {
                
//                 socket.emit("messageEvent", parsedMessage);
//             });
//         }
//     });
// });
// // Start the server
// server.listen(3001, () => {
//     console.log("Server running on port 3001");
// });

// // Configure Express middleware
// app.use(cors());
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// // Import and use routes
// import router from "./routes/user.route.js";
// app.use("/api/v1/user", router);

// export { app };
