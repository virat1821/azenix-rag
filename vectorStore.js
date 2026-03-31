import fs from "fs";

const FILE = "./vectors.json";

// save vectors
export function saveVectors(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// load vectors
export function loadVectors() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

// cosine similarity
export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}