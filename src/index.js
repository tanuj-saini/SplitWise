

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cors from "cors";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import Redis from "ioredis";
import { produceMessage, startMessageConsumer } from "./kafks.js";
import router from "./routes/user.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
         console.log("Database connected");
    })
    .catch((e) => {
        console.error("Database connection error:", e);
        process.exit(1);
    });

const server = http.createServer(app);

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        return 5000; // Reconnect after 5 seconds
    },
};

const pub = new Redis(redisOptions);
const sub = new Redis(redisOptions);

pub.on("error", (err) => {
    console.error("Redis Pub Error:", err);
});

sub.on("error", (err) => {
    console.error("Redis Sub Error:", err);
});

// Configure CORS for Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Allow all origins (or specify allowed origins)
        methods: ["GET", "POST"],
    },
});

// Nested structure to store clients: groupId -> userId -> sockets
const clients = new Map();

// Subscribe to Redis channels
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("Id", (data) => {
        const { userId, groupId } = data;
        
        if (!userId || !groupId) {
            console.error("Invalid userId or groupId received.");
            return socket.disconnect(true); // Force disconnect for invalid data
        }

        // Initialize group structure
        if (!clients.has(groupId)) {
            clients.set(groupId, new Map());
        }
        const group = clients.get(groupId);

        // Initialize user structure with Set for automatic deduplication
        if (!group.has(userId)) {
            group.set(userId, new Set());
        }
        const userSockets = group.get(userId);

        // Add socket to user's connection set
        if (!userSockets.has(socket)) {
            userSockets.add(socket);
            console.log(`User ${userId} added to group ${groupId}`);
        }

        startMessageConsumer(groupId).catch(console.error);
    });


    // socket.on("disconnect", () => {
    //     // Remove the socket from all groups and users
    //     clients.forEach((groupClients, groupId) => {
    //         groupClients.forEach((sockets, userId) => {
    //             groupClients.set(
    //                 userId,
    //                 sockets.filter((s) => s !== socket)
    //             );

    //             // If the user has no more sockets, remove them
    //             if (groupClients.get(userId).length === 0) {
    //                 groupClients.delete(userId);
    //             }
    //         });

    //         // If the group has no more users, remove it
    //         if (groupClients.size === 0) {
    //             clients.delete(groupId);
    //         }
    //     });

       
    // });
    socket.on("disconnect", () => {
        clients.forEach((group, groupId) => {
            group.forEach((userSockets, userId) => {
                if (userSockets.has(socket)) {
                    userSockets.delete(socket);
                    console.log(`Socket ${socket.id} removed from ${userId} in ${groupId}`);
                    
                    // Cleanup empty entries
                    if (userSockets.size === 0) {
                        group.delete(userId);
                        console.log(`User ${userId} removed from group ${groupId}`);
                    }
                }
            });
            
            if (group.size === 0) {
                clients.delete(groupId);
                console.log(`Group ${groupId} removed`);
            }
        });
    });
    socket.on("messageEvent", async (msg) => {
        const { groupId } = msg;

        // Publish the message to the Redis channel named after the groupId
        pub.publish(groupId, JSON.stringify(msg));

        // Ensure the subscriber is subscribed to the groupId channel
        sub.subscribe(groupId, (err) => {
            if (err) {
                // console.error(`Subscription error for ${groupId}:`, err);
            } else {
                // console.log(`Subscribed to Redis channel: ${groupId}`);
            }
        });
    });
});

// Handle messages from Redis
sub.on("message", async (channel, message) => {
    try {
        const parsedMessage = JSON.parse(message);
        await produceMessage(parsedMessage);
        const { userList, groupId } = parsedMessage;

        const group = clients.get(groupId);
        if (!group) return;

        userList.forEach(userId => {
            const userSockets = group.get(userId);
            if (userSockets) {
                userSockets.forEach(socket => {
                    if (socket.connected) { // Check if socket is still active
                        socket.emit("messageEvent", parsedMessage);
                    }
                });
            }
        });
    } catch (error) {
        console.error("Message handling error:", error);
    }
});

server.listen(PORT, () => {
    console.log(`Server and Socket.IO are running on port ${PORT}`);
});

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/api/v1/user", router);

export { app };
