# Chaize

A beautiful chat interface for Google's Gemini AI models.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Google Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chaize

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click the model selector button in the top-left to open settings
2. Enter your Gemini API key (stored locally in your browser)
3. Select your preferred model
4. Start chatting

## Available Models

- Gemini 2.5 Pro
- Gemini 2.5 Flash
- Gemini 2.5 Flash Lite
- Gemini 2.0 Flash
- Gemini 2.0 Flash Lite

## Features

- Dark/Light mode toggle (auto-saves preference)
- Markdown rendering for AI responses
- Code syntax highlighting
- Local API key storage (never sent to our servers)
- Responsive design

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```
