
# Project Setup Guide

This document provides instructions on how to set up and run the Webhook Chat Dashboard application on your local machine for development.

## Architecture Overview

This project uses a modern, build-less setup:

- **React 18** is loaded directly in the browser via an ESM CDN (`esm.sh`).
- **No Build Step:** There is no need for Webpack, Vite, or `npm install`. You can run the project by simply serving the static files.
- **Import Maps:** The `index.html` file uses an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) to tell the browser how to resolve module imports like `react` and `react-dom`.

## Prerequisites

- A modern web browser that supports ES modules and import maps (e.g., Chrome, Firefox, Edge, Safari).
- A simple local web server to serve the project files. This is required to avoid CORS issues with ES module imports from the filesystem.

## Local Development

1.  **Clone the Repository:**
    If you have Git installed, clone the repository to your local machine. Otherwise, you can download the source code as a ZIP file.

2.  **Start a Local Web Server:**
    Navigate to the root directory of the project in your terminal and start a local server. Here are a few common ways to do this:

    - **Using Python 3:**
      ```bash
      python -m http.server
      ```

    - **Using Node.js (with `serve` package):**
      If you have Node.js installed, you can use the `serve` package.
      ```bash
      # Install serve globally if you haven't already
      npm install -g serve
      
      # Run the server
      serve .
      ```

    - **Using VS Code Live Server:**
      If you use Visual Studio Code, you can install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live" from the status bar.

3.  **Access the Application:**
    Once the server is running, it will typically provide a local URL, such as `http://localhost:8000` or `http://127.0.0.1:5500`. Open this URL in your web browser to view and interact with the application.

Any changes you make to the source files will be reflected immediately upon refreshing the browser page.
