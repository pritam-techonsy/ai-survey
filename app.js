const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const axios = require('axios');
const sgMail = require('@sendgrid/mail'); // Add SendGrid
require('dotenv').config(); // Add this line to load environment variables

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In-memory store for surveys and responses
const surveys = {};
const surveyResponses = {};

// Example Auth API: Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Insert user-creation logic, e.g. save to MongoDB.

    // Send a welcome email using SendGrid
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL, // Use the address from your .env
      subject: 'Welcome!',
      text: 'Thanks for registering!',
      html: '<strong>Thanks for registering!</strong>',
    };

    await sgMail.send(msg);
    res.status(201).json({ message: 'User registered and email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// API endpoint to handle prompt input (survey creation)
app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates only functional HTML and JavaScript code representing a survey form. The generated form should include appropriate input fields, labels, a submit button, and all necessary scripts to operate correctly when inserted into <div id='output'></div>."
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

    // Extract the generated survey form HTML and store it with a unique ID.
    const surveyHTML = response.data.choices[0].message.content;
    const surveyId = Date.now().toString();
    surveys[surveyId] = surveyHTML;
    surveyResponses[surveyId] = []; // initialize responses array
    // Return a link to the generated survey form.
    res.json({ link: `/survey/${surveyId}` });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Modified endpoint: Serve survey form wrapped in a form to capture responses
app.get('/survey/:id', (req, res) => {
  const surveyHTML = surveys[req.params.id];
  if (surveyHTML) {
    // Wrap the survey content in a form and add submission handling script
    const wrappedHTML = `
      <!-- ...existing generated survey HTML... -->
      <form id="surveyForm">
        ${surveyHTML}
        <button type="submit">Submit Survey</button>
      </form>
      <script>
        document.getElementById('surveyForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const formData = new FormData(this);
          const jsonData = Object.fromEntries(formData.entries());
          const response = await fetch('/survey/${req.params.id}/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
          });
          const result = await response.json();
          alert(result.message || 'Response recorded.');
        });
      </script>
    `;
    res.send(wrappedHTML);
  } else {
    res.status(404).send('Survey not found.');
  }
});

// New endpoint: List surveys with response count
app.get('/api/surveys', (req, res) => {
  const surveyList = Object.keys(surveys).map(id => ({
    id,
    responses: surveyResponses[id] ? surveyResponses[id].length : 0,
    link: `/survey/${id}`,
    responsesLink: `/survey/${id}/responses`
  }));
  res.json(surveyList);
});

// New endpoint: Save survey responses (assumes survey form submits JSON)
app.post('/survey/:id/response', (req, res) => {
  const surveyId = req.params.id;
  if (surveys[surveyId]) {
    surveyResponses[surveyId].push(req.body);
    res.json({ message: 'Response recorded.' });
  } else {
    res.status(404).json({ error: 'Survey not found.' });
  }
});

// New endpoint: View survey responses
app.get('/survey/:id/responses', (req, res) => {
  const surveyId = req.params.id;
  if (surveys[surveyId]) {
    res.json({ responses: surveyResponses[surveyId] });
  } else {
    res.status(404).json({ error: 'Survey not found.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));