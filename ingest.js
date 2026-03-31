import fs from "fs";
import axios from "axios";
import { saveVectors } from "./vectorStore.js";

const data = fs.readFileSync("./data/data.txt", "utf-8");
const chunks = data.split("\n");

let vectorData = [];

for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  if (!chunk.trim()) continue;

  const res = await axios.post("https://azenix-rag.onrender.com/", {
    model: "nomic-embed-text",
    prompt: chunk,
  });

  vectorData.push({
    text: chunk,
    embedding: res.data.embedding,
  });
}

saveVectors(vectorData);

console.log("✅ Vectors stored in JSON");