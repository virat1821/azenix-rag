import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { loadVectors, cosineSimilarity } from "./vectorStore.js";

dotenv.config();

const app = express();

// 🔥 MUST BE FIRST (before everything)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ✅ Health check route (IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("Azenix AI backend running 🚀");
});

// ✅ Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ✅ Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.message;

    if (!question) {
      return res.status(400).json({ error: "Message is required" });
    }

    const vectors = loadVectors() || [];

    // 🔍 Simple similarity search
    const scored = vectors.map(v => ({
      text: v.text,
      score: cosineSimilarity(v.embedding, v.embedding) // simplified (can improve later)
    }));

    const top = scored.slice(0, 3);
    const context = top.map(v => v.text).join("\n");

    // 🤖 Groq AI call
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `
You are Azenix AI assistant.

- Answer professionally
- Use only provided context
- Keep answers short and helpful
- If unsure, say: "Please contact Azenix for more details."
          `
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

// ✅ Start server (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});