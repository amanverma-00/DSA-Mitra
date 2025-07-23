#!/bin/bash

# Deploy CI/CD Pipeline Setup Script
echo "🚀 Setting up CI/CD Pipeline for DSA mitra..."

# Add all CI/CD files
echo "📁 Adding CI/CD configuration files..."
git add .github/
git add backend/test/
git add frontend/src/test/
git add package.json
git add README.md
git add deploy-cicd.sh

# Check git status
echo "📋 Current git status:"
git status

# Commit changes
echo "💾 Committing CI/CD setup..."
git commit -m "🔧 Setup comprehensive CI/CD pipeline

✨ Features:
- GitHub Actions workflows for CI/CD
- Automated testing for backend and frontend
- Security scanning with CodeQL
- Dependency management with Dependabot
- Performance testing with Lighthouse
- Multi-environment deployment support
- Health checks and rollback capabilities

🛠️ Workflows:
- ci.yml: Continuous Integration
- deploy-production.yml: Production deployment
- maintenance.yml: Automated maintenance

📋 Templates:
- Issue templates for bugs and features
- Pull request template with checklist
- Dependabot configuration

🧪 Testing:
- Basic backend tests with Mocha
- Frontend tests with Vitest
- TypeScript support validation

🔒 Security:
- Environment variable protection
- Automated vulnerability scanning
- Code quality checks

Ready for production deployment! 🎉"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ CI/CD Pipeline setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to your GitHub repository: https://github.com/amanverma-00/dsa-chatbot"
echo "2. Navigate to Settings > Secrets and variables > Actions"
echo "3. Add the required secrets for deployment:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID" 
echo "   - VERCEL_PROJECT_ID"
echo "   - RAILWAY_TOKEN"
echo "   - RAILWAY_SERVICE_ID"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - GROQ_API_KEY"
echo "   - REDIS_PASS"
echo "   - VITE_API_URL"
echo "   - FRONTEND_URL"
echo "   - BACKEND_URL"
echo ""
echo "4. Enable branch protection rules for main branch"
echo "5. The CI/CD pipeline will automatically run on your next push!"
echo ""
echo "🎉 Your DSA mitra project is now production-ready with full CI/CD!"
