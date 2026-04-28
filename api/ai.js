// api/ai.js - Vercel Serverless Function for Groq API

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    let body;

    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { messages } = body || {};


    if (!messages) {
  return res.status(400).json({ error: 'Messages are required' });
}
    // Get API key from environment variable (set in Vercel dashboard)
    const GROK_API_KEY = process.env.GROK_API_KEY;

    if (!GROK_API_KEY) {
        console.error('GROK_API_KEY not set in environment variables');
        return res.status(401).json({
            error: 'API key not configured. Please add GROK_API_KEY to Vercel environment variables.',
            fallback: true
        });
    }

    try {
        console.log('🤖 Calling Groq API...');
        console.log('📝 Messages count:', messages?.length);

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
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
                error: `Groq API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log('✅ Groq API success');
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ Server error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}