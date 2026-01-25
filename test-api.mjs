// Test script for Anthropic API
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("API Key:", process.env.ANTHROPIC_API_KEY?.substring(0, 15) + "...");
  
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      messages: [{ role: "user", content: "Say hello in one word" }],
    });
    console.log("Response:", message);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
