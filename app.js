const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // Add this line to load environment variables

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle prompt input
app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates only functional HTML and JavaScript code, which can be inserted into a <div id='output'></div>. Ensure all scripts execute properly."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));