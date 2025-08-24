
# API Integration Guide

This document explains how the application integrates with external services, including Make.com webhooks and the Google Gemini AI platform.

## Make.com Webhook Integration

### Important: CORS Configuration

For the Webhook Chat module to function correctly, your Make.com webhook **must** be configured to accept requests from the domain where this application is running. This is a security feature of web browsers called Cross-Origin Resource Sharing (CORS).

If you see a `NetworkError` when sending a message, it is almost certainly a CORS issue.

**How to fix this:**
1. Go to your scenario in Make.com.
2. Click on the Webhook module to open its settings.
3. Click "Show advanced settings".
4. In the "CORS" section, add the URL of this application to the list of allowed origins.
   - For local development, this might be `http://localhost:8000` or similar.
   - For a deployed application, it would be its public URL (e.g., `https://my-dashboard.com`).

The core functionality of the Webhook Chat module is to interact with [Make.com](https://www.make.com/) webhooks. This is handled by a dedicated service function.

### `services/makeService.ts`

This file contains the `sendMessageToWebhook` function, which is responsible for all communication with a user-configured Make.com webhook URL.

**Key Logic:**

1.  **API Key Validation:** The function first checks if a Make.com API key is provided. If not, it throws an error immediately.
2.  **HTTP Request (`fetch`)**:
    - **Headers:** It uses the `x-make-apikey` header for authentication, which is required for secured Make.com webhooks.
    - **Body:** The user's message is wrapped in a JSON object: `{ "text": "user message here" }`.
3.  **Response Handling:** The service intelligently handles both JSON and plain text responses from the webhook.
4.  **Error Handling:** A `try...catch` block wraps the `fetch` call to handle network errors or other exceptions.

---

## Google Gemini API Integration

The application now actively uses the Google Gemini API key to power its core AI features. The key is stored in `localStorage` and passed down from the main `App.tsx` component to each feature view.

### AI Agent Module (`AIAgentView.tsx`)

-   **Model:** `gemini-2.5-flash`
-   **Functionality:** This view implements a conversational AI. It uses the `@google/genai` SDK's `ai.chats.create()` method to establish a persistent chat session. Personas are implemented by passing a specific `systemInstruction` during chat creation.
-   **Integration:** When a user sends a message, the view calls `chat.sendMessageStream()` to get a streaming response, which is displayed token-by-token for a real-time chat experience.

### Image Generation Module (`ImageGenerationView.tsx`)

-   **Model:** `imagen-3.0-generate-002`
-   **Functionality:** This view generates images from a text prompt.
-   **Integration:** It calls the `ai.models.generateImages()` method from the SDK. The response contains the image data as a Base64 encoded string, which is then converted into a `data:` URL and rendered in an `<img>` tag.

### Video Generation Module (`VideoGenerationView.tsx`)

-   **Model:** `veo-2.0-generate-001`
-   **Functionality:** This view generates a short video from a text prompt.
-   **Integration:**
    1.  It makes an initial call to `ai.models.generateVideos()`, which starts the asynchronous generation process and returns an `operation` object.
    2.  Because video generation can take several minutes, the application then polls the status of this job by repeatedly calling `ai.operations.getVideosOperation()` every 10 seconds.
    3.  Once the operation is `done`, the response contains a video URI. The application appends the Gemini API key to this URI to authenticate the download and then displays the video in a `<video>` player.

### Google Search Module (`GoogleSearchView.tsx`)

-   **Model:** `gemini-2.5-flash`
-   **Functionality:** This view provides answers to queries that are grounded in real-time Google Search results. It is ideal for questions about recent events or topics.
-   **Integration:**
    1.  It calls the `ai.models.generateContent()` method.
    2.  Crucially, the `config` object for this call includes `tools: [{googleSearch: {}}]`. This tells the model to use Google Search to inform its response.
    3.  **Requirement:** When using Google Search grounding, you **must** display the sources that the model used. The response object contains these sources in `response.candidates[0].groundingMetadata.groundingChunks`. The UI renders these as clickable links.

---

### Suno API Integration

- **Functionality:** This module allows users to generate original music from text prompts.
- **Integration:** The application includes a settings field for a Suno API key. While the current music generation is simulated for demonstration purposes, the integration point is ready for a real API connection. The key would be sent to the Suno API to authenticate and process generation requests.

---

### OpenAI API Key

The application includes a settings field for an OpenAI API key. This key is stored but is **not actively used** in the current version. It is included for potential future enhancements.