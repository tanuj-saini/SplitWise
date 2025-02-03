

import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";



dotenv.config();


const PORT = process.env.PORT || 3000;

connectDB().then(
    () => {
      app.listen(PORT, () => {
        console.log("Server is running on port " + PORT);
      })
    }
).catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
})

