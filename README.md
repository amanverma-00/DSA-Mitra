# 🚀 DSA ChatBot - AI-Powered Learning Assistant

A comprehensive **Data Structures & Algorithms** learning platform with an intelligent AI chatbot that helps students master coding concepts through interactive conversations, personalized learning paths, and detailed explanations.

![GitHub Stars](https://img.shields.io/github/stars/amanverma-00/Dsa-Mitra?style=for-the-badge)
![GitHub Forks](https://img.shields.io/github/forks/amanverma-00/Dsa-Mitra?style=for-the-badge)
![GitHub Issues](https://img.shields.io/github/issues/amanverma-00/Dsa-Mitra?style=for-the-badge)
![License](https://img.shields.io/github/license/amanverma-00/Dsa-Mitra?style=for-the-badge)
![CI/CD](https://img.shields.io/github/actions/workflow/status/amanverma-00/Dsa-Mitra/ci.yml?style=for-the-badge&label=CI/CD)
![Release](https://img.shields.io/github/v/release/amanverma-00/Dsa-Mitra?style=for-the-badge)

![DSA ChatBot](https://img.shields.io/badge/DSA-mitra-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🤖 **Intelligent AI Assistant**
- **Smart Fallback System**: Comprehensive DSA explanations without requiring API keys
- **Context-Aware Responses**: Understands your learning progress and adapts explanations
- **Code Examples**: JavaScript implementations with detailed comments
- **Step-by-Step Walkthroughs**: Visual explanations of complex algorithms

### 📚 **Comprehensive Learning**
- **Complete DSA Coverage**: Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, DP
- **Time/Space Complexity Analysis**: Big O notation with practical examples
- **Interactive Problem Solving**: Real-world coding challenges
- **Progress Tracking**: Monitor your learning journey

### 🎯 **User Experience**
- **Clean, Modern UI**: Built with React + TypeScript + Tailwind CSS
- **Dark/Light Mode**: Comfortable learning in any environment
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Real-time Chat**: Instant responses with typing indicators

### 🔐 **Secure & Reliable**
- **JWT Authentication**: Secure user sessions with HTTP-only cookies
- **Session Management**: Persistent chat history and user preferences
- **Data Privacy**: All conversations stored securely in MongoDB
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for beautiful components
- **React Router** for navigation
- **React Query** for state management

### **Backend**
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### **AI Integration**
- **Intelligent Fallback System** (works offline)
- **Optional GROQ API** integration for enhanced responses
- **Context-aware conversation handling**
- **Educational content optimization**

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/amanverma-00/Dsa-Mitra.git
cd Dsa-Mitra
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
Copy the example environment files and configure them:

```bash
# Copy backend environment file
cp backend/.env.example backend/.env

# Copy frontend environment file
cp frontend/.env.example frontend/.env
```

**Configure Backend** (`backend/.env`):
- Set your MongoDB connection string
- Add a secure JWT secret
- **Optional**: Add your GROQ API key for enhanced AI features
  - Get free API key from [https://console.groq.com](https://console.groq.com)
  - Replace `your-groq-api-key-here` with your actual key

**Configure Frontend** (`frontend/.env`):
- Update `VITE_API_URL` if your backend runs on a different port

### 4. Start Development Servers

**Option 1: Start Both Servers**
```bash
npm run dev
```

**Option 2: Start Individually**
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend  
npm run frontend
```

### 5. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

## 📖 Usage Guide

### **Getting Started**
1. **Sign Up**: Create your account with email and password
2. **Sign In**: Access your personalized dashboard
3. **Start Learning**: Begin a new chat session
4. **Ask Questions**: Type any DSA-related question

### **Example Questions**
```
"What is a binary search tree?"
"Explain time complexity with examples"
"How does merge sort work?"
"What's the difference between arrays and linked lists?"
"What is dynamic programming?"
"Explain the sieve of Eratosthenes algorithm"
```

### **Features to Explore**
- 📊 **Learning Progress**: Track your improvement over time
- 💬 **Chat History**: Review previous conversations
- 🗑️ **Session Management**: Organize your learning sessions
- 🌙 **Dark Mode**: Toggle between light and dark themes

## 🔧 Development

### **Project Structure**
```
dsa-chatbot/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── index.js        # Server entry point
│   └── .env                # Backend environment
├── frontend/               # React + TypeScript SPA
│   ├── client/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── lib/            # Utilities
│   ├── shared/             # Shared utilities
│   └── .env                # Frontend environment
└── package.json            # Root package configuration
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start both frontend and backend
npm run backend          # Start backend only
npm run frontend         # Start frontend only

# Production
npm run build           # Build for production
npm run start           # Start production server

# Utilities
npm run clean           # Clean build artifacts
npm run test            # Run tests
```

### **API Endpoints**
```
Authentication:
POST /user/register      # Create new account
POST /user/login         # Sign in user
POST /user/logout        # Sign out user
GET  /user/getProfile    # Get user profile

Chat Sessions:
POST /api/sessions                    # Create new session
GET  /api/sessions                    # Get user sessions
POST /api/sessions/:id/messages       # Send message
GET  /api/sessions/:id/messages       # Get chat history

Profile:
GET  /api/profile/sessions           # Get session history
GET  /api/profile/learning-progress  # Get learning stats
```

## 🌟 Key Features Explained

### **Intelligent AI System**
The chatbot uses a sophisticated fallback system that provides comprehensive DSA education without requiring external API keys:

- **Offline Capability**: Works completely offline with pre-programmed responses
- **Educational Quality**: University-level explanations with code examples
- **Comprehensive Coverage**: All major DSA topics included
- **Optional Enhancement**: Add GROQ API key for unlimited topic coverage

### **Learning Progress Tracking**
- **Session Analytics**: Track time spent learning
- **Topic Coverage**: Monitor which concepts you've explored
- **Progress Visualization**: Charts and graphs of your improvement
- **Personalized Recommendations**: Suggested topics based on your history

### **Security & Privacy**
- **Secure Authentication**: JWT tokens with HTTP-only cookies
- **Password Protection**: bcrypt hashing with salt rounds
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Privacy First**: Your conversations are private and secure

## 🚀 Deployment

### **Frontend Deployment (Netlify)**
```bash
cd frontend
npm run build
# Deploy dist/spa folder to Netlify
```

### **Backend Deployment (Railway/Heroku)**
```bash
# Set environment variables in your hosting platform
# Deploy the backend folder
```

### **Full-Stack Deployment (Docker)**
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔄 CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with GitHub Actions:

### 🛠️ **Automated Workflows**

#### **Continuous Integration** (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Backend Testing**: Multi-node version testing (18.x, 20.x)
- **Frontend Testing**: Build validation and linting
- **Security Scanning**: CodeQL analysis and dependency audits
- **Staging Deployment**: Automatic deployment to staging environment

#### **Production Deployment** (`deploy-production.yml`)
- **Triggers**: Release creation, Manual dispatch
- **Multi-environment**: Support for staging and production
- **Health Checks**: Post-deployment validation
- **Rollback Support**: Automatic failure detection

#### **Maintenance** (`maintenance.yml`)
- **Scheduled**: Weekly dependency updates
- **Security Monitoring**: Regular vulnerability scans
- **Performance Testing**: Lighthouse CI integration
- **Code Quality**: ESLint and TypeScript checks

### 🔧 **Setup CI/CD**

1. **Configure Secrets** in GitHub repository settings:
```bash
# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_ID=your_service_id

# Environment Variables
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
GROQ_API_KEY=your_groq_api_key
REDIS_PASS=your_redis_password
VITE_API_URL=your_production_api_url
FRONTEND_URL=your_frontend_url
BACKEND_URL=your_backend_url
```

2. **Enable Dependabot** for automated dependency updates
3. **Configure branch protection** rules for `main` branch

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request


## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful UI components
- **GROQ** for AI API integration
- **MongoDB** for reliable data storage
- **Tailwind CSS** for amazing styling capabilities


---

**Made with ❤️ for the coding community**

*Happy Learning! 🚀*
