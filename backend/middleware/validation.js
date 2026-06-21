const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const commentRules = [
  body('placeId')
    .trim().notEmpty().withMessage('Place ID is required')
    .isLength({ max: 200 }).withMessage('Place ID cannot exceed 200 characters'),
  body('placeName')
    .trim().notEmpty().withMessage('Place name is required')
    .isLength({ max: 200 }).withMessage('Place name cannot exceed 200 characters'),
  body('comment')
    .trim().notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

const adminLoginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const userLoginRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const registerRules = [
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim().isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

module.exports = { validate, commentRules, adminLoginRules, userLoginRules, registerRules };
