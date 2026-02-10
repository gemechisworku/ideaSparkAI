# IdeaSpark AI 💡

IdeaSpark AI is a world-class innovation engine designed for product founders and engineers. It transforms raw, unrefined thoughts into professional-grade Software Requirements Specifications (SRS) using advanced reasoning and real-time market grounding.

## ✨ Key Features

- **Semantic Market Search**: Leverages Gemini 3 Flash with Google Search grounding to identify direct and indirect competitors, GitHub repositories, and similar SaaS products.
- **Intelligent Extraction**: Automatically distills raw, multi-line product descriptions into structured Problem and Solution statements.
- **Strategic Refinement**: Analyzes competitor gaps to suggest high-impact feature improvements and strategic differentiators.
- **Technical Blueprinting**: Generates comprehensive, industry-standard SRS documents (Introduction, Interface Requirements, System Features, etc.) using Gemini 3 Pro.
- **Visual Analytics**: Interactive similarity distribution charts help you visualize how close your idea is to existing market solutions.
- **Project Persistence**: Automatically saves your drafts and refined blueprints to browser Local Storage.

## 📁 Project Structure

The application follows a clean, modular React architecture:

```text
.
├── index.html          # Main entry shell with Tailwind and Import Maps
├── index.tsx           # React mounting point
├── App.tsx             # Main layout, navigation logic, and state management
├── types.ts            # Global TypeScript interfaces for Ideas and Analysis
├── services/
│   └── geminiService.ts # Core AI logic (Search, Refinement, SRS Generation)
└── components/
    ├── LandingPage.tsx  # Marketing & "How it Works" overview
    ├── Dashboard.tsx    # Project list and status tracking
    ├── IdeaForm.tsx     # Simplified input (Idea + Features)
    └── IdeaDetail.tsx   # The "Innovation Lab" - multi-step validation UI
```

## 🚀 Local Setup

To run this project locally, follow these steps:

### 1. Prerequisites
- A modern web browser.
- A local development server (e.g., [Vite](https://vitejs.dev/), [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), or `npx serve`).

### 2. Environment Configuration
The application requires a Google Gemini API Key. Ensure the environment variable `API_KEY` is available in your build process or execution context.

```bash
# Example for Vite
VITE_API_KEY=your_gemini_api_key_here
```

### 3. Installation
If you are using a package manager:

```bash
npm install
npm run dev
```

### 4. Direct ESM Usage
If running without a build step, the `index.html` uses **Import Maps** to fetch dependencies (React, Recharts, Lucide) directly from `esm.sh`. Simply serve the root directory and open `index.html`.

## 🛠 Built With

- **React 19**: Modern UI component architecture.
- **Google Gemini API**: Advanced LLM reasoning (Flash and Pro models).
- **Tailwind CSS**: Utility-first styling for a sleek, responsive dashboard.
- **Lucide React**: Clean, consistent iconography.
- **Recharts**: Data visualization for market analysis.

## 📝 Usage Workflow

1. **Spark**: Go to "New Project" and describe your idea in plain English.
2. **Analyze**: Click "Start AI Analysis" to find competitors and refine your core statements.
3. **Refine**: Review "Evolution Suggestions" and select features to add to your backlog.
4. **Blueprint**: Generate the "Full SRS" and download the Markdown file for your development team.
