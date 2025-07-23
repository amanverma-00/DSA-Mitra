const User = require('../models/user');
const Session = require('../models/session');
const Message = require('../models/message');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1h';
const COOKIE_MAX_AGE = 60 * 60 * 1000;

const register = async(req, res) =>{
    try{
        validate(req.body);
        const { username, email, password } = req.body;

        console.log(`🔐 Registration attempt - Email: ${email}, Username: ${username}`);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`❌ Registration failed - Email ${email} already exists`);
            return res.status(409).json({
                success: false,
                message: "Email already registered",
                error: "DUPLICATE_EMAIL"
            });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await User.create({ 
            username, 
            email, 
            password: hashedPassword,
            role: 'user' 
        });
        const payload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role
        };

        const token =  jwt.sign(payload, process.env.JWT_KEY, {expiresIn: TOKEN_EXPIRY});
        res.cookie('token', token, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        const reply = {
            username: newUser.username,
            email: newUser.email,
            _id: newUser._id,
            role: newUser.role,
            createdAt: newUser.createdAt
        }

        console.log(`✅ Registration successful - User: ${newUser.username} (${newUser.email})`);

        res.status(201).json({
            success: true,
            user: reply,
            message: "Registered successfully"
        });
    }
    catch(err){
        console.error('Registration Error:', err);
        res.status(400).json({ error: "Registration failed", details: err.message });
    }
}

const login = async(req, res) =>{
    try{
        const { email, password } = req.body;

        console.log(`🔐 Login attempt - Email: ${email}`);

        if (!email || !password) {
            console.log(`❌ Login failed - Missing email or password`);
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({email});
        if (!user) {
            console.log(`❌ Login failed - User not found: ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log(`❌ Login failed - Invalid password for: ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(`✅ Login successful - User: ${user.username} (${email})`);

        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };
        
        const token =  jwt.sign(payload,process.env.JWT_KEY,{expiresIn: TOKEN_EXPIRY});



        res.cookie('token', token, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        const reply = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        res.status(200).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        console.error('Login Error:', err);
        res.status(500).json({ error: "Login failed", details: err.message });
    }
}

const logout = async (req, res) => {
  console.log(">>> logout sees cookie:", req.cookies);
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ success: false, error: "No token provided" });
  }

  // verify with THE SAME secret used in login/register
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  // blacklist in Redis (skip if Redis is not connected)
  try {
    if (redisClient.isReady) {
      const redisKey = `bl_${token}`;
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      await redisClient.setEx(redisKey, ttl, 'blocked');
    }
  } catch (redisError) {
    console.log('Redis blacklist failed, continuing without blacklist:', redisError.message);
  }

  // clear cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({ success: true, message: "Logout successful" });
};

const deleteProfile = async(req, res) =>{
    try{
        const userId = req.user.userId;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.clearCookie('token');
        res.status(200).json({ message: "Account deleted successfully" });
    }
    catch(err){
        console.error('Delete Error:', err);
        res.status(500).json({ error: "Account deletion failed" });
    }
}

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [user, sessions, stats] = await Promise.all([
      User.findById(userId)
        .select('username email role createdAt learningPreferences'),
      Session.find({ userId, isActive: true })
        .select('sessionId createdAt updatedAt'),
      Message.aggregate([
        { $match: { userId: userId } },
        { $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            totalTokens: { $sum: "$metadata.tokensUsed" },
            concepts: { $addToSet: "$metadata.conceptTags" }
        }},
        { $project: {
            _id: 0,
            totalMessages: 1,
            totalTokens: 1,
            uniqueConcepts: { $size: { $setUnion: "$concepts" } }
        }}
      ])
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user: {
        ...user.toObject(),
        stats: stats[0] || { totalMessages: 0, totalTokens: 0, uniqueConcepts: 0 },
        activeSessions: sessions.length,
        sessions: sessions.map(s => ({
          id: s.sessionId,
          created: s.createdAt,
          lastActive: s.updatedAt
        }))
      }
    });
  }catch (err) {
    console.error('Profile Fetch Error:', err);
    res.status(500).json({ 
      error: "Failed to fetch profile",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

module.exports = { register, login, logout, deleteProfile, getProfile};