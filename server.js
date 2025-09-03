import 'dotenv/config';

// Import the Express web framework (handles HTTP server + routes)
import express from "express";

// Node’s built-in path module (lets us work with folder/file paths easily)
import path from "path";

// fileURLToPath + import.meta.url lets ES modules emulate __dirname / __filename
import { fileURLToPath } from "url";

// Import the official OpenAI client library
import OpenAI from "openai";


// -------------------- PATH SETUP --------------------

// Convert the current module’s URL into a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of this file (project root for server.js)
const __dirname = path.dirname(__filename);


// -------------------- EXPRESS APP SETUP --------------------

const app = express(); // create an Express app instance

// Use the environment port (for deployment) or default to 3000 locally
const PORT = process.env.PORT || 3000;


// -------------------- OPENAI CLIENT --------------------

// Initialize the OpenAI client with your API key
// NOTE: your API key should live in a `.env` file as OPENAI_API_KEY
// Never hardcode your API key into the codebase
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// -------------------- MIDDLEWARE --------------------

// Middleware: allows Express to automatically parse JSON request bodies
// Example: { "year": 2500 } from the frontend becomes req.body.year
app.use(express.json());

// Middleware: serve static frontend files from /public
// Example: public/index.html → http://localhost:3000/
// Example: public/app.js → http://localhost:3000/app.js
app.use(express.static(path.join(__dirname, "public")));


// -------------------- API ROUTE --------------------

// Define a POST endpoint at /future
// The frontend can call this with fetch("/future", { method: "POST", body: {...} })
app.post("/future", async (req, res) => {
  try {
    // Extract year sent by the frontend
    const { year, type } = req.body;

    // Build a dynamic prompt for the GPT model
    const prompt = `The year is ${year}. Describe what Earth might be like in terms of society, technology, and environment. Give the response in a ${type} style and keep it strictly under 150 words.`;

    // Call OpenAI’s Chat Completions API
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // fast + lightweight model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150, // limit response length
    });

    // Send the model’s text back to the frontend
    res.json({ text: response.choices[0].message.content });

  } catch (err) {
    // Log errors and send a 500 response if something goes wrong
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: "Failed to fetch future description" });
  }
});


// -------------------- FALLBACK ROUTE --------------------

// Catch-all GET route: if no static file or API matches,
// always return index.html (important for SPAs or client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// -------------------- START SERVER --------------------

// Start listening on the chosen port
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
