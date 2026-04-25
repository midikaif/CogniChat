import { useState, useEffect } from "react";
import api from "../../apis/api";
import "./WakeUpScreen.css";

const WakeUpScreen = ({ onReady }) => {
  const [text, setText] = useState("");
  const [featureIndex, setFeatureIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("challenges");
  const [activeChallenge, setActiveChallenge] = useState(0);

  // Typewriter text for the server wake-up status
  const loadingStatuses = [
    "Waking up the AI server...",
    "Connecting to MongoDB...",
    "Initializing WebSockets...",
    "Loading Google GenAI...",
    "Preparing Pinecone Vector Search...",
    "Almost there...",
  ];

  const projectDetails = {
    title: "CogniChat Architecture",
    description:
      "CogniChat is a high-performance, real-time AI application leveraging RAG (Retrieval-Augmented Generation) and semantic caching. It is designed with a focus on non-blocking I/O, optimized render cycles, and cloud cost efficiency to deliver instant, context-aware responses.",
    features: [
      "Real-time WebSocket Streaming (Socket.io)",
      "Semantic Caching & Vector Search (Pinecone)",
      "Google GenAI Integration",
      "Persistent Chat History (MongoDB)",
      "Secure HttpOnly JWT Authentication",
    ],
  };

  const challenges = [
    {
      title: "RAG & Latency Masking",
      hook: "My RAG system worked, but the 'First Time to Byte' was almost 3 seconds!",
      risingAction:
        "I profiled the Node.js backend and found blocking operations: generating embeddings, searching Pinecone, and saving to MongoDB sequentially.",
      conflict:
        "Users were waiting for the database before they could even talk to the AI.",
      action:
        "I re-architected the Socket.io handler. I skipped vector searches for new chats, used Promise.all for parallel execution, and decoupled the AI response from system maintenance (Fire-and-Forget).",
      reward:
        "Reduced average response latency from ~3s down to ~1.5s, making the application feel snappy and responsive.",
    },
    {
      title: "The 'Optimistic UI' Sync",
      hook: "I wanted CogniChat to feel as instant as WhatsApp or ChatGPT.",
      risingAction:
        "I built an Optimistic UI where messages appear instantly without waiting for the server.",
      conflict:
        "But the backend took ~500ms to create the chat. Navigating immediately caused the app to crash because the Chat ID didn't exist yet!",
      action:
        "I decoupled the display logic from the database logic. I updated the UI with a temporary state, awaited the real ID, and ensured an atomic state update before navigating.",
      reward: "A seamless, crash-free experience with zero perceived latency.",
    },
    {
      title: "Semantic Caching & Vector Dilution",
      hook: "I focused heavily on backend performance and cloud cost optimization.",
      risingAction:
        "I built a Semantic Cache using Pinecone to intercept common questions and serve cached responses instantly without waking up the LLM.",
      conflict:
        "Initially, my cache hit rate was terrible due to 'Vector Dilution'—embedding the short prompt with a massive AI response skewed the Cosine Similarity score.",
      action:
        "I decoupled the index from the payload. I embedded strictly the user's short prompt as the searchable index and stored the conversational pair as structured JSON in the metadata.",
      reward:
        "Similarity scores shot up to 0.99 for cache hits, reducing LLM API calls and costs by 50%.",
    },
    {
      title: "React Context & Render Thrashing",
      hook: "I engineered a high-performance React application by optimizing the render cycle.",
      risingAction:
        "While building CogniChat, I noticed a severe 'Context Ripple' bug.",
      conflict:
        "Toggling the sidebar UI forced the entire Chat Window to re-render, running expensive Markdown parsing unnecessarily and causing a Flash of Unstyled Content.",
      action:
        "I used the React Profiler to identify broken 'Referential Equality' in the Context Provider. I implemented useMemo at both the Context and Component levels.",
      reward:
        "Eliminated 100% of unnecessary re-renders on UI toggles, fixing visual bugs and improving responsiveness.",
    },
    {
      title: "WebSocket Memory Leaks",
      hook: "Navigating between chat sessions was causing erratic behavior and duplicate AI responses.",
      risingAction:
        "I audited the component lifecycle to ensure WebSockets weren't leaving ghost listeners behind.",
      conflict:
        "Anonymous inline functions in socket.on() lacked reference equality, so the cleanup function was failing to detach them.",
      action:
        "I refactored the architecture to use strictly named function references for all event handlers.",
      reward:
        "The cleanup function acted like a scalpel, perfectly detaching listeners, patching a silent memory leak, and stabilizing the UI.",
    },
  ];

  // 1. Typewriter Effect Logic
  useEffect(() => {
    const currentStatus = loadingStatuses[featureIndex];
    const typeSpeed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentStatus) {
        setTimeout(() => setIsDeleting(true), 1200);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setFeatureIndex((prev) => (prev + 1) % loadingStatuses.length);
      } else {
        setText(
          currentStatus.substring(0, text.length + (isDeleting ? -1 : 1)),
        );
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, featureIndex]);

  // 2. Backend Ping Logic (wakes up the server)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await api.get("/api/auth/verify");
      } catch (error) {
        console.log("Server is awake!", error);
      } finally {
        onReady();
      }
    };
    wakeUpBackend();
  }, [onReady]);

  return (
    <div className="wakeup-container">
      {/* Header / Loading Indicator */}
      <div className="wakeup-header">
        <h1 className="wakeup-title">Starting CogniChat API...</h1>
        <div className="wakeup-status">
          {text}
          <span className="wakeup-cursor">|</span>
        </div>
        <p className="wakeup-note">
          (The free-tier backend is spinning up. While you wait, explore the
          architecture below!)
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="wakeup-tabs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`wakeup-tab-btn ${
            activeTab === "overview" ? "active" : "inactive"
          }`}
        >
          Project Overview
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`wakeup-tab-btn ${
            activeTab === "challenges" ? "active" : "inactive"
          }`}
        >
          Engineering Logs
        </button>
      </div>

      {/* Interactive Content Area */}
      <div className="wakeup-content-area">
        {activeTab === "overview" ? (
          /* --- Project Overview Tab --- */
          <div className="wakeup-overview">
            <h2 className="wakeup-overview-title">{projectDetails.title}</h2>
            <p className="wakeup-overview-desc">{projectDetails.description}</p>
            <h3 className="wakeup-features-title">Core Features</h3>
            <ul className="wakeup-features-list">
              {projectDetails.features.map((feature, idx) => (
                <li key={idx} className="wakeup-feature-item">
                  <span className="wakeup-feature-icon">✔</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          /* --- Engineering Logs Tab --- */
          <>
            {/* Left Sidebar - Navigation */}
            <div className="wakeup-sidebar">
              <div className="wakeup-sidebar-scroll">
                {challenges.map((challenge, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveChallenge(idx)}
                    className={`wakeup-challenge-btn ${
                      activeChallenge === idx ? "active" : "inactive"
                    }`}
                  >
                    <span className="wakeup-challenge-log-label">
                      LOG #{idx + 1}
                    </span>
                    <span className="wakeup-challenge-btn-title">
                      {challenge.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Content Area - Challenge Details */}
            <div className="wakeup-challenge-content">
              <div className="wakeup-challenge-details">
                <h2 className="wakeup-challenge-title">
                  {challenges[activeChallenge].title}
                </h2>

                <div className="wakeup-challenge-text">
                  <p>
                    <span className="wakeup-label wakeup-label-hook">
                      The Hook:
                    </span>
                    {challenges[activeChallenge].hook}
                  </p>
                  <p>
                    <span className="wakeup-label wakeup-label-rising">
                      Rising Action:
                    </span>
                    {challenges[activeChallenge].risingAction}
                  </p>
                  <p>
                    <span className="wakeup-label wakeup-label-conflict">
                      The Conflict:
                    </span>
                    {challenges[activeChallenge].conflict}
                  </p>
                  <p>
                    <span className="wakeup-label wakeup-label-action">
                      The Action:
                    </span>
                    {challenges[activeChallenge].action}
                  </p>
                  <div className="wakeup-reward-box">
                    <span className="wakeup-reward-label">The Reward:</span>
                    <span className="wakeup-reward-text">
                      {challenges[activeChallenge].reward}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WakeUpScreen;