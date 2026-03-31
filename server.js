import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors());
app.options("*", cors());

// ✅ Body parser
app.use(express.json());

// ✅ Health route
app.get("/", (req, res) => {
  res.send("Azenix AI backend running 🚀");
});

// ✅ Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Chat endpoint (NO FILES, NO VECTORS)
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.message;

    if (!question) {
      return res.status(400).json({ error: "Message required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are Azenix AI assistant. Answer professionally.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});