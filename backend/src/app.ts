import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import campaignRoutes from "./routes/campaignRoutes";
import messageRoutes from "./routes/messageRoutes";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.get('/',(req:Request,res:Response)=>{
  res.send('Hello welcome to api');
})

app.use("/campaigns", campaignRoutes);
app.use("/personalized-message", messageRoutes);

export default app;
