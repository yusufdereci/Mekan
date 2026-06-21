const rateLimit = require('express-rate-limit');

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            100,
  standardHeaders: true,
  legacyHeaders:  false,
  keyGenerator:   getClientIp,
  message:        { success: false, message: 'Too many requests. Please try again in 15 minutes.' }
});

const commentLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            5,
  keyGenerator:   getClientIp,
  message:        { success: false, message: 'You can submit at most 5 comments per hour.' }
});

const loginLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            10,
  keyGenerator:   getClientIp,
  message:        { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

module.exports = { generalLimiter, commentLimiter, loginLimiter };
