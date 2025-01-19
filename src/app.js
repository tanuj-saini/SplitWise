import cors from "cors";
import express from "express";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({extended: true,limit: "16kb"}));






import router from "./routes/user.route.js";

//routes declaration
app.use("/api/v1/user", router);







export { app };
