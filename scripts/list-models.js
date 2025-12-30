const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Try to read .env.local for the GROQ_API_KEY
let apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const match = envFile.match(/GROQ_API_KEY=(.*)/);
            if (match && match[1]) {
                apiKey = match[1].trim();
            }
        }
    } catch (e) {
        // Ignore error
    }
}

if (!apiKey) {
    console.error('❌ No GROQ_API_KEY found in environment or .env.local');
    process.exit(1);
}

// 2. Fetch available models from Groq
const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('\n✅ Available Groq Models:');
            console.log('-------------------------');
            response.data.forEach(model => {
                console.log(`- ${model.id}`);
            });
            console.log('-------------------------\n');
        } else {
            console.error(`❌ Error: ${res.statusCode} ${res.statusMessage}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
});

req.end();




// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const fs = require('fs');
// const path = require('path');

// // Try to read .env.local manually since we can't rely on dotenv being installed/configured for this script
// try {
//     const envPath = path.resolve(process.cwd(), '.env.local');
//     const envFile = fs.readFileSync(envPath, 'utf8');
//     const match = envFile.match(/GEMINI_API_KEY=(.*)/);
//     if (match && match[1]) {
//         process.env.GEMINI_API_KEY = match[1].trim();
//     }
// } catch (e) {
//     console.log('Could not read .env.local');
// }

// async function listModels() {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//         console.error('No API key found in .env.local');
//         return;
//     }

//     const genAI = new GoogleGenerativeAI(apiKey);

//     try {
//         // Note: listModels might not be directly exposed on the client instance in older versions,
//         // but let's try the standard way or fallback to a direct fetch if needed.
//         // Actually, for the JS SDK, we might need to use the model manager if available, 
//         // but the simplest way is often just to try a known model or use the REST API.
//         // Let's use the REST API for certainty to avoid SDK version issues.

//         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
//         const data = await response.json();

//         if (data.models) {
//             console.log('Available Models:');
//             data.models.forEach(m => {
//                 if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
//                     console.log(`- ${m.name} (${m.displayName})`);
//                 }
//             });
//         } else {
//             console.log('No models found or error:', data);
//         }
//     } catch (error) {
//         console.error('Error listing models:', error);
//     }
// }

// listModels();
