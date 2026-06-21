const express = require('express');
const router  = express.Router();

const { register, login, me } = require('../controllers/auth');
const { authMiddleware }       = require('../middleware/authMiddleware');
const { loginLimiter }         = require('../middleware/rateLimiter');
const { registerRules, userLoginRules, validate } = require('../middleware/validation');

router.post('/register', loginLimiter, registerRules, validate, register);
router.post('/login',    loginLimiter, userLoginRules, validate, login);
router.get('/me',        authMiddleware, me);

module.exports = router;
