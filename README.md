[!React](https://reactjs.org/)
[!Node.js](https://nodejs.org/)
[!Vercel](https://vercel.com/)
[!Render](https://render.com/)

# CogniChat - High-Performance AI Chat Application

CogniChat is a production-ready, full-stack AI chat application engineered for performance, scalability, and security. It moves beyond a simple AI wrapper by implementing an advanced Retrieval-Augmented Generation (RAG) pipeline, a sophisticated semantic caching layer to reduce costs, and a suite of architectural patterns to ensure a snappy, real-time user experience.

The application features a decoupled architecture with a React frontend deployed on **Vercel** and a Node.js/Express backend on **Render**, demonstrating modern CI/CD and hosting practices.

## 🌐 Live Demo

- **Frontend (Vercel):** https://cogni-chat.vercel.app/
- **Backend (Render):** https://cognichat-fv23.onrender.com/

> **Note:** The backend is hosted on Render's free tier and may take ~50 seconds to "wake up" on the first request. An interactive loading screen has been implemented to showcase project features during this time.

## ✨ Key Features

- **Advanced RAG Pipeline:** Integrates Google GenAI with a Pinecone vector database for context-aware, accurate responses.
- **Semantic Caching:** Drastically reduces LLM API costs (>50%) and latency by caching and retrieving answers for semantically similar questions.
- **Real-time Communication:** Built with Socket.io for instant, bidirectional messaging.
- **Enterprise-Grade Security:** Uses secure, `HttpOnly` cookies for JWT-based authentication, mitigating XSS vulnerabilities.
- **Optimistic UI:** Messages appear instantly in the UI, providing a seamless user experience akin to modern chat applications.
- **Decoupled Architecture:** Scalable frontend on Vercel and backend on Render.
- **Persistent Chat History:** Conversations are saved to a MongoDB database.

## 🏆 Architectural Highlights & Engineering Decisions

This project was an exercise in solving real-world engineering challenges that arise in production applications.

### Backend Performance (Latency Masking)

- **Problem:** Initial user messages experienced high latency (~3s) due to sequential, blocking operations (vector generation, DB search, etc.).
- **Solution:** Re-architected the Socket.io handler for concurrent processing (`Promise.all`) and "fire-and-forget" background tasks. This decoupled the user-facing response from heavy system maintenance, **cutting average response latency to ~1.5s**.

### Frontend Performance (Render Optimization)

- **Problem:** A "Context Ripple" bug caused by the React Context Provider was forcing the entire chat window to re-render on simple UI toggles, leading to expensive Markdown parsing and a "Flash of Unstyled Content" (FOUC).
- **Solution:** Used the React DevTools Profiler to diagnose the broken "Referential Equality". By stabilizing the context value with `useMemo`, **100% of unnecessary re-renders were eliminated**, fixing the UI bugs and improving app responsiveness.

### Cost Optimization (Semantic Caching)

- **Problem:** Repeatedly calling the expensive Gemini LLM API for common user queries is inefficient and costly.
- **Solution:** Designed a "Semantic Caching" layer using Pinecone. By embedding only the user's prompt (to avoid "Vector Dilution") and storing the conversational pair in the vector's metadata, the system now achieves a **>98% cache hit rate for common questions, cutting LLM API costs by over 50%**.

### State Management & UX (Optimistic UI & Race Conditions)

- **Problem:** Navigating to a new chat immediately after creation caused crashes, as the component would mount before the database returned the new `chatId`.
- **Solution:** Implemented an "Optimistic UI" by updating local state first, then awaiting the API response before navigating. Switched from `useState` to `useRef` for managing the WebSocket connection to solve race conditions and prevent component unmounts during state transitions.

### Security (HttpOnly Authentication)

- **Problem:** Storing JWTs in `localStorage` is vulnerable to Cross-Site Scripting (XSS) attacks.
- **Solution:** Implemented a robust authentication system using `HttpOnly` cookies. These cookies are inaccessible to client-side JavaScript, providing a strong defense against XSS-based token theft.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Socket.io Client, Axios, TailwindCSS
- **Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose), Google GenAI, Pinecone
- **Authentication:** JWT, `bcryptjs`, `cookie-parser`
- **Deployment:** Vercel (Frontend), Render (Backend)

## 🚀 Running Locally

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/midikaif/CogniChat.git
    cd CogniChat
    ```

2.  **Setup Backend:**

    ```bash
    cd Backend
    npm install
    # Create a .env file based on .env.example
    cp .env.example .env
    # Add your credentials to .env
    npm start
    ```

3.  **Setup Frontend (in a new terminal):**
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:5173`.

## 👤 Author

**Md Kaif Khan**

- mdkaif0153@gmail.com
