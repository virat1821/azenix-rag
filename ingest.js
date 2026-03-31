import fs from "fs";
import { saveVectors } from "./vectorStore.js";

const data = fs.readFileSync("./data/data.txt", "utf-8");

// simple chunks
const chunks = data.split("\n").filter(line => line.trim());

const vectorData = chunks.map(chunk => ({
  text: chunk,
  embedding: [] // dummy (not used)
}));

saveVectors(vectorData);

console.log("✅ Data stored (no embeddings)");