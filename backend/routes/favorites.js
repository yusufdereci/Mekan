const express  = require('express');
const router   = express.Router();

const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favorite');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body }           = require('express-validator');
const { validate }       = require('../middleware/validation');

router.use(authMiddleware);

const favoriteRules = [
  body('placeId').trim().notEmpty().withMessage('Place ID is required'),
  body('placeName').trim().notEmpty().withMessage('Place name is required')
];

router.get('/',            getFavorites);
router.post('/', favoriteRules, validate, addFavorite);
router.delete('/:placeId', removeFavorite);

module.exports = router;
