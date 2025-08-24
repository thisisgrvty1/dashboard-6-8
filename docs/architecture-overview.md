# Architecture Overview

This document provides a high-level overview of the application's architecture, focusing on component structure, state management, and data flow.

## Core Technologies

- **React 18:** The core UI library for building the user interface with functional components and hooks.
- **TypeScript:** Provides static typing for improved code quality, maintainability, and developer experience.
- **Tailwind CSS:** A utility-first CSS framework used for all styling, loaded via CDN for simplicity.

## Component Structure

The application is architected around a main router component (`App.tsx`) that renders different top-level views based on the application's state.

- **`App.tsx`**: The root component. It acts as a top-level router, managing the `view` state to render the correct page. It also holds shared global state, such as `apiKeys` and all user-generated content for history features.

- **`Home.tsx`**: The main landing page of the application. It displays a selection of top-level modules and a recent activity stream. Clicking on a module updates the `view` state in `App.tsx`, navigating the user to the corresponding view.

- **`WebhookChatView.tsx`**: A dedicated, self-contained view for all webhook chat functionality. It manages its own internal state, such as which specific chat module is selected. It receives the list of modules from `App.tsx` and renders either a list of all chat modules or the `ModuleView` for a selected chat.

- **`ModuleView.tsx`**: The main chat interface for a single webhook module. It's rendered by `WebhookChatView.tsx`.

- **`AIAgentView.tsx`, `ImageGenerationView.tsx`, `VideoGenerationView.tsx`, `MusicGenerationView.tsx`, `AISearchView.tsx`**: These are complex, stateful components that manage their own sub-views (e.g., a generation view vs. a history view). They receive their respective historical data from `App.tsx`.

- **`GeminiLiveView.tsx`**: A technology preview component demonstrating a real-time, multi-modal chat interface with Gemini.

- **`Settings.tsx`**: A dedicated view for users to input and save their API keys.

- **`Header.tsx`**: A presentational component responsible for displaying the application title and primary navigation (Home and Settings), along with a global job status indicator.

## State Management

State is managed through a combination of global and local state using React hooks.

### Global State (`App.tsx`)

- **`view`**: A state variable (`useState`) of type `TopLevelView` that controls which main component is rendered.
- **`apiKeys`**: An object containing API keys, persisted to `localStorage` via the `useLocalStorage` hook. It's passed down to `Settings` for editing and to feature views that need it for API calls.
- **`modules`**: An array of all webhook chat modules, persisted using `useLocalStorage`. It is the single source of truth for this feature's data.

### History State (Global in `App.tsx`)

To provide a persistent user experience, all major generated content is saved to `localStorage` and managed as global state in `App.tsx`.
- **`chatSessions`**: An array of `ChatSession` objects for the AI Agent. Each session contains its own message history.
- **`generatedImages`**: An array of `GeneratedImage` objects, storing the prompt, image URL(s), and metadata for every image created.
- **`generatedVideos`**: An array of `GeneratedVideo` objects, storing the prompt, video URL(s), and metadata for every video created.
- **`generatedMusic`**: An array of `GeneratedMusic` objects, storing the prompt, audio URL, and metadata for every music track created.
- **`aiSearchResults`**: An array of `AISearchResult` objects, storing the prompt, the AI-generated answer, and the web sources used.

### Feature-Level and Sub-View State

- **`WebhookChatView.tsx`**: Manages a local `selectedModuleId` state to determine whether to show the list of modules or the chat interface for a single module.
- **Sub-View Management**: Components like `AIAgentView` and `ImageGenerationView` use local state (e.g., `selectedSessionId` or `subView`) to toggle between different internal screens, such as the main generation interface and the full history view. This encapsulates the view logic within the relevant module.

### Local Component State

Components like `ModuleView` and `CreateModuleModal` manage their own transient UI state (e.g., form inputs, loading status), keeping them encapsulated and reusable.

## Data Flow

The data flow is unidirectional. `App.tsx` owns all the core data. This data is passed down as props to the feature views. When a child component needs to modify the data (e.g., saving a new chat message or a generated image), it calls a setter function (e.g., `setChatSessions`) that was passed down as a prop from `App.tsx`, triggering a re-render of the application with the new state.