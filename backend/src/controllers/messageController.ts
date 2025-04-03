import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getPersonalizedMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, job_title, company, location, summary } = req.body;
    if (!name || !job_title || !company || !location || !summary) {
      res.status(400).json({
        message: "All fields (name, job_title, company, location, summary) are required."
      });
      return; 
    }

    const prompt = `Generate a short, engaging LinkedIn outreach message for a professional connection.  
    The recipient is ${name}, currently working as a ${job_title} at ${company}, located in ${location}.  
    Their profile summary: "${summary}". The message should introduce Outflo and highlight how it can help professionals like ${name}.  
    Mention how Outflo automates outreach to boost meetings and sales.  
    Keep it **concise, friendly, and action-driven**, encouraging a response. Don't generate subject line. Add dont add anything like add  your name`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    if (!response.text) {
      res.status(500).json({ message: "Failed to generate response from AI." });
      return;
    }

    res.status(200).json({ message: response.text.trim() });
  } catch (err) {
    console.error("Error generating message:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
