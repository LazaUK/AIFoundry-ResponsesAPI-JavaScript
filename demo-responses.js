// ============================================
// Azure OpenAI - Responses API Demo
// ============================================
// This demo shows how to use the "Responses API" with
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
//   node demo-responses.js
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

  console.log("Sending request to Azure OpenAI (Responses API)...\n");

  try {
    const response = await client.responses.create({
      model: AZURE_OPENAI_API_DEPLOY,
      input: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Please limit your responses to 3 sentences.",
        },
        {
          role: "user",
          content: "What is JavaScript?",
        },
      ],
    });

    console.log("Response received!\n");
    console.log("─".repeat(50));

    if (response.output_text) {
      console.log(response.output_text);
    }
    else if (response.output && Array.isArray(response.output)) {
      const assistantMessage = response.output.find(item => item.role === "assistant");
      if (assistantMessage && assistantMessage.content && assistantMessage.content[0]) {
        console.log(assistantMessage.content[0].text);
      } else {
        console.log("Unexpected response structure. Full response:");
        console.log(JSON.stringify(response, null, 2));
      }
    }
    else {
      console.log("Unexpected response structure. Full response:");
      console.log(JSON.stringify(response, null, 2));
    }

    console.log("─".repeat(50));
  } catch (error) {
    console.error("Error:", error.message);

    if (error.message.includes("DefaultAzureCredential")) {
      console.log("\nError: Make sure you've logged in with az login");
    }
  }
}

main();