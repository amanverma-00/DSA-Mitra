# Contributing to DSA ChatBot

Thank you for your interest in contributing to DSA ChatBot! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Git
- A code editor (VS Code recommended)

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/dsa-chatbot.git
   cd dsa-chatbot
   ```
3. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```
4. **Set up environment variables** (see README.md)
5. **Start development servers**:
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### 1. **Bug Reports**
- Use the [GitHub Issues](https://github.com/yourusername/dsa-chatbot/issues) page
- Search existing issues before creating a new one
- Include detailed steps to reproduce
- Provide system information (OS, Node.js version, etc.)

### 2. **Feature Requests**
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Include mockups or examples if applicable
- Discuss implementation approach

### 3. **Code Contributions**
- Pick an issue or propose a new feature
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make your changes following our coding standards
- Test your changes thoroughly
- Submit a pull request

## 📝 Coding Standards

### **General Guidelines**
- Write clean, readable, and maintainable code
- Follow existing code style and patterns
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### **Frontend (React/TypeScript)**
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error boundaries

### **Backend (Node.js/Express)**
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation and sanitization
- Follow RESTful API conventions
- Include proper logging

### **Database (MongoDB)**
- Use Mongoose schemas with validation
- Implement proper indexing
- Follow data modeling best practices
- Add database migrations when needed

## 🧪 Testing

### **Running Tests**
```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

### **Writing Tests**
- Write unit tests for new functions
- Add integration tests for API endpoints
- Include edge cases and error scenarios
- Maintain good test coverage

## 📋 Pull Request Process

### **Before Submitting**
1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run the test suite** and ensure all tests pass
4. **Check code formatting** and linting
5. **Update the README** if you've added features

### **Pull Request Guidelines**
- Use a clear and descriptive title
- Reference related issues: "Fixes #123"
- Provide a detailed description of changes
- Include screenshots for UI changes
- Keep PRs focused and atomic

### **Review Process**
1. **Automated checks** must pass (tests, linting)
2. **Code review** by maintainers
3. **Address feedback** and make requested changes
4. **Final approval** and merge

## 🎨 Design Guidelines

### **UI/UX Principles**
- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure WCAG compliance
- **Responsiveness**: Support all device sizes
- **Performance**: Optimize for speed and efficiency
- **User-Friendly**: Intuitive and easy to use

### **Color Scheme**
- Primary: Blue gradient (#0EA5E9 to #3B82F6)
- Secondary: Gray tones for text and backgrounds
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

## 🔧 Development Tips

### **Useful Commands**
```bash
# Start development with hot reload
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

### **Debugging**
- Use browser dev tools for frontend debugging
- Use Node.js debugger for backend issues
- Check console logs and network requests
- Use MongoDB Compass for database inspection

## 📚 Resources

### **Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Tools**
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser extension

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `priority: low` - Nice to have features

## 🤝 Community Guidelines

### **Be Respectful**
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### **Be Collaborative**
- Help others learn and grow
- Share knowledge and resources
- Provide constructive feedback
- Celebrate others' contributions

## 📞 Getting Help

### **Questions?**
- Check existing [GitHub Issues](https://github.com/yourusername/dsa-chatbot/issues)
- Join our [Discord community](https://discord.gg/dsachatbot)
- Email us at: contribute@dsachatbot.com

### **Stuck?**
- Review the README.md setup instructions
- Check the troubleshooting section
- Ask for help in GitHub Discussions
- Reach out to maintainers

## 🎉 Recognition

Contributors will be:
- Listed in our README.md contributors section
- Mentioned in release notes for significant contributions
- Invited to join our contributor Discord channel
- Eligible for special contributor badges

## 📄 License

By contributing to DSA ChatBot, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DSA ChatBot! Together, we're making DSA learning accessible to everyone.** 🚀
