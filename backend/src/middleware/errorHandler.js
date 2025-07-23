// Add specialized Groq error handling
module.exports = (err, req, res, next) => {
  if (err.message.includes('GROQ_API_KEY')) {
    return res.status(500).json({ 
      error: "Server configuration error",
      details: "Missing Groq API key"
    });
  }
  
  if (err.response?.status === 429) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: "Please wait before sending more requests"
    });
  }
  
  // ... other error cases ...
  
  next(err);
};