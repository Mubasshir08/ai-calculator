# AI Calculator

An AI-powered calculator that goes beyond simple arithmetic. Upload an image of a math problem, crop it to the part you need, and let AI read and solve it for you.

---

## Features

- 🤖 **AI problem solving** using Google Gemini and OpenAI models
- 🖼️ **Image upload** so you can solve problems straight from a photo or screenshot
- ✂️ **Built-in image cropping** to focus on the exact problem you want solved
- ⚡ **Server-side image processing** with Sharp for fast, optimized uploads
- 🎨 **Modern, responsive interface** built with React and Tailwind CSS

---

## Tech Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | [React 19](https://react.dev) |
| Build tool | [Vite 6](https://vite.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Image cropping | [react-easy-crop](https://github.com/ValentinH/react-easy-crop) |
| HTTP client | [Axios](https://axios-http.com) |
| Linting | ESLint 9 |

### Backend

| Area | Technology |
| --- | --- |
| Runtime | [Node.js](https://nodejs.org) (ES modules) |
| Framework | [Express 4](https://expressjs.com) |
| AI | [Google Generative AI SDK](https://github.com/google-gemini/generative-ai-js) and the [OpenAI SDK](https://github.com/openai/openai-node) |
| File uploads | [Multer](https://github.com/expressjs/multer) |
| Image processing | [Sharp](https://sharp.pixelplumbing.com) |
| Other | CORS, dotenv, nodemon |

---

## Project Structure

```
ai-calculator/
├── frontend/     # React + Vite app
└── backend/      # Express API that talks to the AI models
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- npm
- API keys for the AI services you want to use:
  - a [Google AI Studio](https://aistudio.google.com) key for Gemini
  - an [OpenAI](https://platform.openai.com) key

### 1. Clone the repository

```bash
git clone https://github.com/Mubasshir08/ai-calculator.git
cd ai-calculator
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder with your own values for:

- your Gemini API key
- your OpenAI API key
- the port the server should run on

Then start the server:

```bash
node index.js
```

For automatic restarts while developing, use nodemon instead:

```bash
npx nodemon index.js
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will start on the address shown in your terminal (usually `http://localhost:5173`). Make sure the backend is running so the frontend can reach it.

---

## Available Scripts

### Frontend (`/frontend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Backend (`/backend`)

| Command | Description |
| --- | --- |
| `node index.js` | Start the Express server |
| `npx nodemon index.js` | Start the server with auto-restart |

---

## Keep Your API Keys Safe

Never commit your `.env` file. Make sure it is listed in `.gitignore` so your Gemini and OpenAI keys stay private.

---

## Author

**Mubasshir** — [@Mubasshir08](https://github.com/Mubasshir08)
