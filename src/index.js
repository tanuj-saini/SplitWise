

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
    socket.on("Id", (data) => {
        const { userId, groupId } = data; // Extract values safely
        console.log(userId);
        console.log(groupId);

        if (!userId || !groupId) {
            console.error("Invalid userId or groupId received.");
            return; // Stop execution if data is missing
        }

        // Initialize the group if it doesn't exist
        if (!clients.has(groupId)) {
            clients.set(groupId, new Map());
        }

        const groupClients = clients.get(groupId);

        // Check if the user already exists in the group
        if (!groupClients.has(userId)) {
            // Initialize the user if it doesn't exist
            groupClients.set(userId, []);
        }

        // Add the socket to the user's list if it's not already there
        const userSockets = groupClients.get(userId);
        if (!userSockets.includes(socket)) {
            userSockets.push(socket);
        }

        startMessageConsumer(groupId).catch(console.error);
    });

    socket.on("disconnect", () => {
        // Iterate over all groups
        clients.forEach((groupClients, groupId) => {
            // Collect users to remove
            const usersToRemove = [];

            groupClients.forEach((sockets, userId) => {
                // Filter out the disconnected socket
                const updatedSockets = sockets.filter((s) => s !== socket);

                if (updatedSockets.length === 0) {
                    usersToRemove.push(userId); // Mark user for removal
                } else {
                    groupClients.set(userId, updatedSockets); // Update sockets
                }
            });
            console.log(usersToRemove);
            // Remove users with no sockets
            usersToRemove.forEach((userId) => groupClients.delete(userId));

            // Remove empty groups
            if (groupClients.size === 0) {
                clients.delete(groupId);
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
                console.error(`Subscription error for ${groupId}:`, err);
            } else {
                console.log(`Subscribed to Redis channel: ${groupId}`);
            }
        });
    });
});

// Handle messages from Redis
sub.on("message", async (channel, message) => {
    const parsedMessage = JSON.parse(message);
    await produceMessage(message);
    const { userList, message: msg, createdBy, groupId } = parsedMessage;

    // Get the group's clients
    const groupClients = clients.get(groupId);

    if (groupClients) {
        // Forward the message to all users in the group except the sender
        userList.forEach((userId) => {
          
                groupClients.get(userId).forEach((socket) => {
                    console.log("message");
                    console.log(userId);
                    socket.emit("messageEvent", parsedMessage);
                });
            
        });
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
