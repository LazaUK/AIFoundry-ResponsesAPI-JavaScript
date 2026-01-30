// ============================================
// Azure OpenAI - Chat Completions API Demo
// Multi-turn Conversation Example
// ============================================
// This demo shows how to manually manage conversation
// history by maintaining the messages array yourself
//
// Prerequisites:
//   1. Node.js installed (version 18 or higher)
//   2. An Azure OpenAI resource with a model deployment
//   3. Azure CLI installed and logged in (az login)
//
// Installation:
//   npm install openai @azure/identity
//
// Environment Variables (set before running):
//   AZURE_OPENAI_API_BASE    - Your endpoint (e.g., https://YOUR-RESOURCE.openai.azure.com/openai/v1/)
//   AZURE_OPENAI_API_DEPLOY  - Your model deployment name
//
// Run:
//   node demo-chat-completions.js
// ============================================

const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");
const { OpenAI } = require("openai");

const AZURE_OPENAI_API_BASE = process.env.AZURE_OPENAI_API_BASE;
const AZURE_OPENAI_API_DEPLOY = process.env.AZURE_OPENAI_API_DEPLOY;

if (!AZURE_OPENAI_API_BASE || !AZURE_OPENAI_API_DEPLOY) {
  console.error("Error: Environment variables not set properly!");
  process.exit(1);
}

async function main() {
  const tokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default"
  );

  const client = new OpenAI({
    baseURL: AZURE_OPENAI_API_BASE,
    apiKey: tokenProvider,
  });

  console.log("=".repeat(60));
  console.log("CHAT COMPLETIONS API - Multi-turn Conversation Demo");
  console.log("(History managed manually via messages array)");
  console.log("=".repeat(60));

  // Define conversation turns
  const questions = [
    "What is the capital of France?",
    "What is its population?",
    "Name 3 famous landmarks there."
  ];

  // Initialize messages with system prompt
  const messages = [
    { role: "system", content: "You are a helpful assistant. Keep responses brief." }
  ];

  try {
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n[Turn ${i + 1}] User: ${question}\n`);

      // Add user message to history
      messages.push({ role: "user", content: question });

      const response = await client.chat.completions.create({
        model: AZURE_OPENAI_API_DEPLOY,
        messages: messages,
        max_tokens: 150,
      });

      const answer = response.choices[0].message.content;

      // Add assistant response to history for next turn
      messages.push({ role: "assistant", content: answer });

      console.log("AI Agent:", answer);
      console.log("─".repeat(60));
    }

  } catch (error) {
    console.error("Error:", error.message);

    if (error.message.includes("DefaultAzureCredential")) {
      console.log("\nError: Make sure you've logged in with az login");
    }
  }
}

main();
