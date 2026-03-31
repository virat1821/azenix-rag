import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ CORS (simple & correct)
app.use(cors());

// ✅ JSON
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Azenix AI backend running 🚀");
});

// ✅ Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Chat
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.message;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are Azenix AI assistant." },
        { role: "user", content: question },
      ],
    });

    const reply =
      completion?.choices?.[0]?.message?.content || "No response";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Server error" });
  }
});

// ✅ Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});