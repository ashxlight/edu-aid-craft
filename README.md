# EduAid Craft

An Educational Accessibility Platform designed to provide accessible learning materials for students with disabilities. It incorporates AI-driven file parsing, Text-to-Speech (TTS), Braille translation, and customizable dynamic formatting to cater to various accessibility needs.

## Features

- **Document Analysis & Conversion:** Extracts content from formats like PDF, DOCX, PPTX.
- **Audio Generation:** Integrates Google Text-to-Speech (TTS) to generate audio content.
- **Braille Translation:** Converts text directly to digital Braille format.
- **Adaptive UI:** Fully responsive frontend using React, Tailwind CSS, and Shadcn UI.
- **Secure Authentication:** JWT-based authentication combined with Google OAuth integration.
- **AI Integrations:** Uses Groq SDK for content processing and summarization.

## Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** components
- **Framer Motion** for animations
- **React Query** for server state management

### Backend
- **Node.js** & **Express**
- **MongoDB** / Mongoose
- **Passport.js** & JWT for Auth
- **Groq SDK** (AI processing)
- **pdf-parse**, **mammoth**, **pptxgenjs**
- **google-tts-api**, **braille**

## Project Structure

- `/src` - React frontend code (pages, components, utilities).
- `/backend` - Express backend server and API endpoints.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Groq API Key
- Google OAuth credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashxlight/edu-aid-craft.git
   cd edu-aid-craft
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Variables:**
   - Create a `.env` file in the `backend/` directory with your required API keys, MongoDB URI, and OAuth credentials.
   - Example variables usually include `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, etc.

### Running the App Locally

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
# From the root directory
npm run dev
```

The app will typically be accessible on `http://localhost:5173`.

## License
ISC
