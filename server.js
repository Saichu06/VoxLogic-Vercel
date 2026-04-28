const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 8080; // Using your working port

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

console.log("DIR:", __dirname);

// ========== HTML ROUTES ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'loader.html')); // Use loader as main
});

app.get('/manual', (req, res) => {
  res.sendFile(path.join(__dirname, 'manual.html'));
});

app.get('/loader', (req, res) => {
  res.sendFile(path.join(__dirname, 'loader.html'));
});

app.get('/try2ds', (req, res) => {
  res.sendFile(path.join(__dirname, 'try2ds.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== AI API ROUTE ==========
app.post('/api/ai', async (req, res) => {
  const { messages } = req.body;

  // Check if API key exists
  if (!process.env.GROK_API_KEY) {
    console.error('❌ GROK_API_KEY not found in .env file');
    return res.status(401).json({ 
      error: 'API key not configured. Please add GROK_API_KEY to .env file'
    });
  }

  try {
    console.log('🤖 Calling Groq API...');
    console.log('📝 Messages:', messages.length);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.7,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Groq API success');
    res.json(data);

  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiConfigured: !!process.env.GROK_API_KEY,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════╗`);
  console.log(`║     🚀 SRM VOXLOGIC SERVER STARTED            ║`);
  console.log(`╚════════════════════════════════════════════════╝`);
  console.log(`\n📡 Server: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.GROK_API_KEY ? '✅ Loaded from .env' : '❌ NOT FOUND'}`);
  console.log(`\n📄 Available Pages:`);
  console.log(`   - http://localhost:${PORT}/ (Loader/Main)`);
  console.log(`   - http://localhost:${PORT}/try2ds`);
  console.log(`   - http://localhost:${PORT}/manual`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`\n📡 API Endpoint: POST http://localhost:${PORT}/api/ai\n`);
});