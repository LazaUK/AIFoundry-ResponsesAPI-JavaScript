// ============================================
// Azure OpenAI - Chat Completions API Demo
// ============================================
// This demo shows how to use the "Chat Completions API" with
// Microsoft Entra ID authentication
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

// Validate environment variables
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

  console.log("Sending request to Azure OpenAI (Chat Completions API)...\n");

  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant. Please limit your responses to 3 sentences.",
      },
      {
        role: "user",
        content: "What is JavaScript?",
      },
    ];

    const result = await client.chat.completions.create({
      model: AZURE_OPENAI_API_DEPLOY,
      messages: messages,
      max_tokens: 150,
    });

    console.log("Response received!\n");
    console.log("─".repeat(50));
    console.log(result.choices[0].message.content);
    console.log("─".repeat(50));
  } catch (error) {
    console.error("Error:", error.message);

    if (error.message.includes("DefaultAzureCredential")) {
      console.log("\nError: Make sure you've logged in with az login");
    }
  }
}

main();
