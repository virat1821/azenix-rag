import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ CORS (FIXED for browser + Render)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Handle preflight safely (no wildcard crash)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Health route
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
      return res.status(400).json({ reply: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are Azenix AI assistant. Answer professionally and clearly."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    const reply =
      completion?.choices?.[0]?.message?.content || "No response";

    res.json({ reply });

  } catch (error) {
    console.error("❌ Error:", error.message);

    res.status(500).json({
      reply: "⚠️ Server error. Please try again."
    });
  }
});

// ✅ Start server (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});