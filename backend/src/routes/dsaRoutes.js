const express = require('express');
const router = express.Router();
const dsaController = require('../controller/dsaController');
const { authenticate } = require('../middleware/authMiddleware');

// DSA problem generation
router.post('/generate-problem', authenticate, dsaController.generateProblem);

// Solution analysis
router.post('/analyze-solution', authenticate, dsaController.analyzeSolution);

module.exports = router;
