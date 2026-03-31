import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { loadVectors, cosineSimilarity } from "./vectorStore.js";

dotenv.config();

const app = express();

// ✅ CORS (robust + production safe)
const corsOptions = {
  origin: "*", // change to your domain later
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// ✅ Body parser
app.use(express.json());

// ✅ Health route (for testing)
app.get("/", (req, res) => {
  res.send("Azenix AI backend running 🚀");
});

// ✅ Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.message;

    if (!question) {
      return res.status(400).json({ error: "Message is required" });
    }

   let vectors = [];

try {
  vectors = loadVectors();
} catch (err) {
  console.log("⚠️ vectors not found, running without RAG");
  vectors = [];
}

    // 🔍 Basic retrieval (safe fallback)
    const top = vectors.slice(0, 3);
    const context = top.map(v => v.text).join("\n");

    // 🤖 AI call
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
          `,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

// ✅ Start server (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});