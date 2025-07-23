// controllers/dsaController.js
const { Groq } = require("groq-sdk");

// Initialize Groq only if API key is available
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
} else {
  console.warn('GROQ_API_KEY not configured - DSA generation features will be disabled');
}

// Generate DSA problems
exports.generateProblem = async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({
        error: "DSA problem generation service is not available. GROQ_API_KEY not configured."
      });
    }

    const { topic, difficulty } = req.body;

    const prompt = `
    Generate a ${difficulty}-level Data Structures and Algorithms problem about ${topic}.
    Include:
    1. Problem statement
    2. Input/output format
    3. Constraints
    4. Sample test case
    5. Recommended approach (in 1 sentence)
    6. Expected time complexity
    `;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.4,
      max_tokens: 512
    });

    res.json({ problem: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate problem" });
  }
};

// Analyze solution code
exports.analyzeSolution = async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({
        error: "Code analysis service is not available. GROQ_API_KEY not configured."
      });
    }

    const { code, language, problem } = req.body;

    const prompt = `
    Analyze this ${language} solution for a DSA problem:
    Problem: ${problem}
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Provide:
    1. Correctness assessment
    2. Time complexity analysis
    3. Space complexity analysis
    4. Potential improvements
    5. Alternative approaches
    `;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 1024
    });
    
    res.json({ analysis: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze solution" });
  }
};