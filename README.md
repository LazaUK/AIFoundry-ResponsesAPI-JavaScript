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
The following snippet shows how to send a system instruction and a user query to the model.

``` JavaScript
const response = await client.responses.create({
    model: process.env.AZURE_OPENAI_API_DEPLOY,
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

// Printing the structured output
console.log(response.output_text);
```

### 3.2 Running the Demo

``` PowerShell
node demo-responses.js
```

### 3.3 Expected Output
If setup successfully, you should expect to get a response looking like this:

``` JSON
Sending request to Azure OpenAI (Responses API)...

Response received!

──────────────────────────────────────────────────
JavaScript is a programming language commonly used to create interactive effects within web browsers.
It allows developers to build dynamic content, control multimedia, animate images, and handle user inputs on websites.
JavaScript runs on the client side, meaning it executes directly in the user's web browser.
──────────────────────────────────────────────────
```

## Part 4: Test of Chat Completions API
The **Chat Completions API** is a legacy conversation-based approach. The `demo-chat-completions.js` file uses the `client.chat.completions.create` method, and maintains conversation context across multiple exchanges.

### 4.1 Example Implementation
The following snippet shows how to send messages using the Chat Completions format.

``` JavaScript
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
    model: process.env.AZURE_OPENAI_API_DEPLOY,
    messages: messages,
    max_tokens: 150,
});

// Printing the response
console.log(result.choices[0].message.content);
```

### 4.2 Running the Demo

``` PowerShell
node demo-chat-completions.js
```

### 4.3 Expected Output
If setup successfully, you should expect to get a response looking like this:

``` JSON
Sending request to Azure OpenAI (Chat Completions API)...

Response received!

──────────────────────────────────────────────────
JavaScript is a high-level, interpreted programming language commonly used to create interactive effects within web browsers.
It enables dynamic content such as animations, form validation, and handling user events on websites.
Additionally, JavaScript can be used on the server side with environments like Node.js.
──────────────────────────────────────────────────
```

## Part 5: Test of Conversations API

> [!WARNING]
> At the time of writing in January 2026, Conversations API is still not supported in Azure OpenAI. If you are interested in this capability, please upvote [here](https://feedback.azure.com/d365community/idea/a151a81e-00a9-f011-aa44-7c1e52926d78).
