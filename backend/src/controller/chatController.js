/**
 * Chat Controller - Production-ready chat functionality with AI integration
 * Handles streaming chat responses and message management
 */

const { Groq } = require("groq-sdk");
const Session = require('../models/session');
const Message = require('../models/message');

// Initialize Groq client with error handling
let groq;
try {
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not found - AI features will be disabled');
  } else {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
} catch (error) {
  console.error('❌ Failed to initialize Groq client:', error.message);
}

/**
 * Stream AI response to client using Server-Sent Events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.streamMessage = async (req, res) => {
  try {
    // Validate Groq availability
    if (!groq) {
      return res.status(503).json({
        success: false,
        error: 'AI service unavailable'
      });
    }

    const { sessionId, content } = req.body;
    const userId = req.user.id; // Fixed: use req.user.id consistently

    // Input validation
    if (!sessionId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and message content are required'
      });
    }

    // Validate session ownership
    const session = await Session.findOne({ sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied'
      });
    }

    // Save user message
    const userMessage = new Message({
      sessionId: session._id, // Use MongoDB ObjectId for consistency
      userId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    });
    await userMessage.save();

    // Get conversation history (limit for performance)
    const history = await Message.find({ sessionId: session._id })
      .sort({ timestamp: 1 })
      .limit(20)
      .lean(); // Use lean() for better performance

    // Prepare messages for AI
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(session.context)
      },
      ...history.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content
      }))
    ];

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    let fullResponse = "";
    let tokenCount = 0;

    try {
      // Create AI stream
      const stream = await groq.chat.completions.create({
        messages,
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      });

      // Stream tokens to client
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullResponse += token;
          tokenCount++;

          // Send token as SSE event
          res.write(`data: ${JSON.stringify({
            token,
            type: 'content'
          })}\n\n`);
        }
      }

      // Save AI response to database
      const aiMessage = new Message({
        sessionId: session._id,
        userId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        metadata: {
          tokensUsed: tokenCount,
          model: "mixtral-8x7b-32768",
          streamed: true
        }
      });
      await aiMessage.save();

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        messageId: aiMessage._id
      })}\n\n`);

    } catch (aiError) {
      console.error('AI streaming error:', aiError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'AI service temporarily unavailable'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Stream message error:', error);

    // Send error event if headers not sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Stream processing failed'
      })}\n\n`);
      res.end();
    }
  }
};

/**
 * Build system prompt based on session context
 * @param {Object} context - Session context object
 * @returns {string} - Formatted system prompt
 */
function buildSystemPrompt(context = {}) {
  const basePrompt = `You are an expert DSA (Data Structures and Algorithms) instructor. Your role is to help students learn and understand DSA concepts effectively through clear explanations, practical examples, and guided problem-solving.

Key guidelines:
- Provide step-by-step explanations
- Use concrete examples and analogies
- Encourage hands-on practice
- Break down complex concepts into digestible parts
- Ask clarifying questions when needed
- Provide code examples when appropriate`;

  let prompt = basePrompt;

  if (context.currentTopic) {
    prompt += `\n\nCurrent focus: ${context.currentTopic}`;
  }

  if (context.difficultyLevel) {
    prompt += `\n\nAdjust explanations for ${context.difficultyLevel} level understanding.`;
  }

  if (context.lastConcept) {
    prompt += `\n\nPreviously discussed: ${context.lastConcept}`;
  }

  return prompt;
}

module.exports = {
  streamMessage: exports.streamMessage,
  buildSystemPrompt
};