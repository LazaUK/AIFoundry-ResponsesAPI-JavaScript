# Azure AI Foundry: JavaScript demos with Azure OpenAI's Responses & Chat Completions API
This repo demonstrates the use of **Azure OpenAI** GPT models with **Responses API** and **Chat Completions API** in JavaScript.

> [!NOTE]
> Specifics of the Azure OpenAI models API lifecycle can be found on this [AI Foundry documentation page](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle).

## 📑 Table of Contents:
- [Part 1: Configuring Solution Environment](#part-1-configuring-solution-environment)
- [Part 2: Client Initialisation](#part-2-client-initialisation)
- [Part 3: Test of Responses API](#part-3-test-of-responses-api)
- [Part 4: Test of Chat Completions API](#part-4-test-of-chat-completions-api)
- [Part 5: Test of Conversations API](#part-5-test-of-conversations-api)

## Part 1: Configuring Solution Environment
To run the provided JavaScript demos, you'll need to set up your Azure AI Foundry resource and install required packages.

### 1.1 Azure AI Foundry Setup
Ensure you have an Azure AI Foundry resource with a deployed Azure OpenAI model (e.g., **gpt-4.1-mini**).

### 1.2 Authentication
The demos utilise **Microsoft Entra ID** (former Azure AD) for secure authentication. This is done via the `DefaultAzureCredential` from the `@azure/identity` package.

Before running the demos, ensure you are logged in:
``` PowerShell
az login
```

### 1.3 Environment Variables
Configure the following environment variables. Note the use of the new `/openai/v1/` base path suffix to support versionless routing:

| Environment Variable    | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| AZURE_OPENAI_API_BASE   | The endpoint URL (e.g., https://AOAI_RESOURCE.openai.azure.com/openai/v1/). |
| AZURE_OPENAI_API_DEPLOY | The name of your model deployment.                                          |

### 1.4 Installation
Install required JS libraries:

``` Bash
npm install openai @azure/identity
```

## Part 2: Client Initialisation
To align with the latest Azure OpenAI API developments, these demos implemented new formats:

- **Standard OpenAI Class**: We use the base `OpenAI` class.
- **No Explicit API Version**: By pointing to the `/openai/v1/` path in the `baseURL`, the system uses the latest stable API version.
- **Integrated Token Provider**: Authentication is handled by passing the bearer token provider directly into the `apiKey` parameter.

``` JavaScript
const { DefaultAzureCredential, getBearerTokenProvider } = require("@azure/identity");
const { OpenAI } = require("openai");

// Create token provider for Microsoft Entra ID authentication
const tokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default"
);

// Simplified initialization
const client = new OpenAI({
    baseURL: process.env.AZURE_OPENAI_API_BASE,
    apiKey: tokenProvider,
});
```

## Part 3: Test of Responses API
The **Responses API** provides a flexible way to interact with advanced models. The `demo-responses.js` file uses the `client.responses.create` method, designed for high-performance interactions where conversation logic managed by the backend.

### 3.1 Example Implementation
The following snippet shows a multi-turn conversation where the backend manages history via `previous_response_id`.

``` JavaScript
// Define conversation turns
const questions = [
  "What is the capital of France?",
  "What is its population?",
  "Name 3 famous landmarks there."
];

let previousResponseId = null;

for (let i = 0; i < questions.length; i++) {
  const requestParams = {
    model: process.env.AZURE_OPENAI_API_DEPLOY,
    input: questions[i],
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

  // Store response ID for next turn
  previousResponseId = response.id;
}
```

### 3.2 Running the Demo

``` PowerShell
node demo-responses.js
```

### 3.3 Expected Output
If setup successfully, you should expect to get a response looking like this:

``` JSON
============================================================
RESPONSES API - Multi-turn Conversation Demo
(History managed on backend via previous_response_id)
============================================================

[Turn 1] User: What is the capital of France?

AI Agent: The capital of France is Paris.
────────────────────────────────────────────────────────────

[Turn 2] User: What is its population?

AI Agent: As of the most recent data, the population of Paris is approximately 2.1 million people within the city proper.
────────────────────────────────────────────────────────────

[Turn 3] User: Name 3 famous landmarks there.

AI Agent: Three famous landmarks in Paris are:
1. Eiffel Tower
2. Louvre Museum
3. Notre-Dame Cathedral
────────────────────────────────────────────────────────────
```

## Part 4: Test of Chat Completions API
The **Chat Completions API** is a legacy conversation-based approach. The `demo-chat-completions.js` file uses the `client.chat.completions.create` method, and maintains conversation context across multiple exchanges.

### 4.1 Example Implementation
The following snippet shows a multi-turn conversation where history is managed manually via the `messages` array.

``` JavaScript
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

for (let i = 0; i < questions.length; i++) {
  // Add user message to history
  messages.push({ role: "user", content: questions[i] });

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_API_DEPLOY,
    messages: messages,
    max_tokens: 150,
  });

  const answer = response.choices[0].message.content;

  // Add assistant response to history for next turn
  messages.push({ role: "assistant", content: answer });

  console.log("AI Agent:", answer);
}
```

### 4.2 Running the Demo

``` PowerShell
node demo-chat-completions.js
```

### 4.3 Expected Output
If setup successfully, you should expect to get a response looking like this:

``` JSON
============================================================
CHAT COMPLETIONS API - Multi-turn Conversation Demo
(History managed manually via messages array)
============================================================

[Turn 1] User: What is the capital of France?

AI Agent: The capital of France is Paris.
────────────────────────────────────────────────────────────

[Turn 2] User: What is its population?

AI Agent: As of 2024, the population of Paris is approximately 2.1 million people.
────────────────────────────────────────────────────────────

[Turn 3] User: Name 3 famous landmarks there.

AI Agent: Three famous landmarks in Paris are:
1. Eiffel Tower
2. Louvre Museum
3. Notre-Dame Cathedral
────────────────────────────────────────────────────────────
```

## Part 5: Test of Conversations API

> [!WARNING]
> At the time of writing in January 2026, Conversations API was not supported in Azure OpenAI yet. If you are interested in this capability, please upvote it [here](https://feedback.azure.com/d365community/idea/a151a81e-00a9-f011-aa44-7c1e52926d78).
