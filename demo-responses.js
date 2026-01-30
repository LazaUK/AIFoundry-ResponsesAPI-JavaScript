// ============================================
// Azure OpenAI - Responses API Demo
// Multi-turn Conversation Example
// ============================================
// This demo shows how the Responses API manages
// conversation history on the backend using previous_response_id
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
//   node demo-responses.js
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
  console.log("RESPONSES API - Multi-turn Conversation Demo");
  console.log("(History managed on backend via previous_response_id)");
  console.log("=".repeat(60));

  // Define conversation turns
  const questions = [
    "What is the capital of France?",
    "What is its population?",
    "Name 3 famous landmarks there."
  ];

  try {
    let previousResponseId = null;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n[Turn ${i + 1}] User: ${question}\n`);

      const requestParams = {
        model: AZURE_OPENAI_API_DEPLOY,
        input: question,
      };

      // Add system instructions only on first turn
      if (i === 0) {
        requestParams.instructions = "You are a helpful assistant. Keep responses brief.";
      }

      // Chain to previous response if exists
      if (previousResponseId) {
        requestParams.previous_response_id = previousResponseId;
      }

      const response = await client.responses.create(requestParams);

      console.log("AI Agent:", response.output_text);
      console.log("─".repeat(60));

      // Store response ID for next turn
      previousResponseId = response.id;
    }

  } catch (error) {
    console.error("Error:", error.message);

    if (error.message.includes("DefaultAzureCredential")) {
      console.log("\nError: Make sure you've logged in with az login");
    }
  }
}

main();
