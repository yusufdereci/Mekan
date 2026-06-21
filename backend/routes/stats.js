const express = require('express');
const router  = express.Router();

const { getPlaceStats, getRanking, getTrending, getPlaceOfMonth } = require('../controllers/stats');

router.get('/place-of-month', getPlaceOfMonth);
router.get('/trending',       getTrending);
router.get('/ranking',        getRanking);
router.get('/:placeId',       getPlaceStats);

module.exports = router;