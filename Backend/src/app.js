const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');


const app = express()

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://llmmodel-midikaif.onrender.com",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);



module.exports = app;