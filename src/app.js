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
import cors from "cors";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import Redis from "ioredis";
import { produceMessage, startMessageConsumer } from "./kafks.js";

const app = express();
const server = http.createServer(app);

// Enhanced Redis configuration with fallbacks
const redisOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 500, 5000),
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        return err.message.includes(targetError);
    },
    enableOfflineQueue: false
};

const pub = new Redis(redisOptions);
const sub = new Redis(redisOptions);

// Enhanced Redis error handling
const handleRedisError = (clientType) => (err) => {
    console.error(`Redis ${clientType} Error:`, err);
    if (err.code === "ECONNREFUSED") {
        console.error("Redis connection refused. Check credentials and network access.");
    }
};

pub.on("error", handleRedisError("Publisher"));
sub.on("error", handleRedisError("Subscriber"));

// Configure CORS properly for both Express and Socket.IO
const corsOptions = {
    origin: process.env.NODE_ENV === "production" 
        ? "https://splitwise-242x.onrender.com" 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

app.use(cors(corsOptions));

// Improved Socket.IO configuration
const io = new SocketIOServer(server, {
    cors: corsOptions,
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: false
});

const clients = new Map();

// Redis subscription management
const subscribedChannels = new Set();

const subscribeToChannel = async (channel) => {
    if (!subscribedChannels.has(channel)) {
        try {
            await sub.subscribe(channel);
            subscribedChannels.add(channel);
            console.log(`Subscribed to Redis channel: ${channel}`);
        } catch (err) {
            console.error(`Subscription error for ${channel}:`, err);
        }
    }
};

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("Id", async (data) => {
        try {
            const { userId, groupId } = data;
            
            if (!userId || !groupId) {
                throw new Error("Missing userId or groupId");
            }

            if (!clients.has(userId)) {
                clients.set(userId, new Set());
            }
            clients.get(userId).add(socket);

            await subscribeToChannel(groupId);
            await startMessageConsumer(groupId);
            
            console.log(`User ${userId} joined group ${groupId}`);
        } catch (err) {
            console.error("ID registration error:", err);
            socket.emit("error", { message: "Invalid registration data" });
        }
    });

    socket.on("messageEvent", async (msg) => {
        try {
            const { groupId } = msg;
            if (!groupId) throw new Error("Missing groupId in message");
            
            await pub.publish(groupId, JSON.stringify(msg));
            console.log(`Message published to ${groupId}`);
        } catch (err) {
            console.error("Message handling error:", err);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    socket.on("disconnect", () => {
        clients.forEach((sockets, userId) => {
            if (sockets.has(socket)) {
                sockets.delete(socket);
                if (sockets.size === 0) {
                    clients.delete(userId);
                }
            }
        });
        console.log(`Disconnected: ${socket.id}`);
    });

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });
});

// Redis message handling
sub.on("message", async (channel, message) => {
    try {
        const parsedMessage = JSON.parse(message);
        await produceMessage(parsedMessage);
        
        const { userList, createdBy } = parsedMessage;
        if (!userList || !Array.isArray(userList)) return;

        userList.forEach(userId => {
            if (clients.has(userId)) {
                clients.get(userId).forEach(socket => {
                    if (socket.connected && userId !== createdBy) {
                        socket.emit("messageEvent", parsedMessage);
                    }
                });
            }
        });
    } catch (err) {
        console.error("Redis message processing error:", err);
    }
});

// Express configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        redis: pub.status === "ready" ? "connected" : "disconnected",
        websockets: clients.size,
        timestamp: new Date().toISOString()
    });
});

// Routes
import router from "./routes/user.route.js";
app.use("/api/v1/user", router);

// Server startup
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
// });

// Cleanup on shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    
    try {
        await pub.quit();
        await sub.quit();
        server.close();
        console.log("Resources cleaned up");
        process.exit(0);
    } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1);
    }
});

export { app, io, pub, sub };