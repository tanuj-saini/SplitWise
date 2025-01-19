import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({extended: true,limit: "16kb"}));



// //routes
// import userRoute from "./routes/user.route.js";





// //routes declaration
// app.use("/api/v1/user", userRoute);



export {app}