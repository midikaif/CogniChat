# CogniChat - AI-Powered Chat Application

A modern, real-time chat application powered by AI, built with React, Node.js, and WebSockets.

## 🌟 Features

- **Real-time Messaging**: WebSocket-based instant messaging
- **AI Integration**: Google GenAI integration for intelligent responses
- **Vector Search**: Pinecone-powered semantic search capabilities
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Chat History**: Persistent chat storage with MongoDB
- **Modern UI**: React + Vite with responsive design
- **Chat Management**: Create, view, and delete chat sessions
- **Settings Panel**: User preferences and account management

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Marked** - Markdown parsing

### Backend

- **Node.js + Express** - Server framework
- **Socket.io** - WebSocket server
- **MongoDB + Mongoose** - Database
- **Google GenAI** - AI capabilities
- **Pinecone** - Vector database for semantic search
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Google GenAI API key
- Pinecone API key

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/midikaif/chat-gpt-001.git
cd chat-gpt-001
```

### 2. Install dependencies

```bash
npm run build
```

### 3. Configure Environment Variables

#### Backend Setup

Create `.env` file in the `Backend` directory:

```bash
cp Backend/.env.example Backend/.env
```

Edit `Backend/.env` with your credentials:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_google_genai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
PORT=3000
```

#### Frontend Setup

Create `.env` file in the `Frontend` directory:

```bash
cp Frontend/.env.example Frontend/.env
```

Edit `Frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

## 🎯 Running the Application

### Development Mode

#### Backend (Terminal 1)

```bash
cd Backend
npm install
npm start
```

The backend server will run on `http://localhost:3000`

#### Frontend (Terminal 2)

```bash
cd Frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Build

```bash
npm run build
```

This will:

1. Install all dependencies
2. Build the React frontend
3. Prepare the backend for production

## 📁 Project Structure

```
chat-gpt-001/
├── Backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middlewares/        # Custom middleware
│   │   ├── services/           # External services
│   │   ├── db/                 # Database connection
│   │   └── sockets/            # WebSocket handling
│   ├── public/                 # Static files
│   └── server.js               # Entry point
├── Frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── Context/            # Global state management
│   │   ├── apis/               # API calls
│   │   ├── utils/              # Utility functions
│   │   ├── assets/             # Images and assets
│   │   └── main.jsx            # Entry point
│   └── index.html
└── package.json                # Root package config
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify authentication

### Chat Management

- `POST /api/chat` - Create new chat
- `GET /api/chat` - Get all chats
- `GET /api/chat/:id` - Get chat messages
- `DELETE /api/chat/:id` - Delete chat

## 🔄 WebSocket Events

### Client → Server

- `ai-message` - Send message to AI

### Server → Client

- `ai-response` - Receive AI response

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Environment variable protection
- Secure cookie handling

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👤 Author

**Md Kaif Khan**

## 🙏 Acknowledgments

- Google GenAI for AI capabilities
- Pinecone for vector search
- MongoDB for database
- Socket.io for real-time communication

## 📧 Support

For support, email: [your-email] or open an issue on GitHub.

---

**Note**: Make sure all environment variables are properly configured before running the application.
