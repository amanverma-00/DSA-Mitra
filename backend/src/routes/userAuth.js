const express = require('express');
const authRouter = express.Router();
const { register, login, logout, deleteProfile, getProfile } = require('../controller/userAuthentication');
const {authenticate, authorize} = require('../middleware/authMiddleware');


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', authenticate, logout);
authRouter.delete('/deleteProfile', authenticate, deleteProfile);
authRouter.get('/getProfile', authenticate, getProfile);

module.exports = authRouter;