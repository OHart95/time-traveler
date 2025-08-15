
import OpenAI from "openai";
import 'dotenv/config';

// Create OpenAI client using your API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple function to ask ChatGPT about the future
export async function getFutureDescription(yearsInFuture, style) {
  const styles = {
    realistic: "Provide a realistic, science-based prediction",
    scifi: "Provide an imaginative science fiction scenario",
    humorous: "Provide a silly and humorous scenario"
  };

  const prompt = `${styles[style] || styles.realistic} for what the world might be like ${yearsInFuture} years from now. Keep it to one paragraph.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a creative storyteller with knowledge of science and culture." },
      { role: "user", content: prompt }
    ]
  });

  console.log(`\n--- ${style.toUpperCase()} FUTURE ---\n`);
  console.log(response.choices[0].message.content.trim());
}

// Test it out
(async () => {
  await getFutureDescription(100, "realistic");
  await getFutureDescription(100, "scifi");
  await getFutureDescription(100, "humorous");
})();
