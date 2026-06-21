const express = require('express');
const router  = express.Router();

const { createComment, getComments, getAllComments } = require('../controllers/comment');
const { commentLimiter }             = require('../middleware/rateLimiter');
const { commentRules, validate }     = require('../middleware/validation');

router.get('/',           getAllComments);
router.post('/',          commentLimiter, commentRules, validate, createComment);
router.get('/:placeId',   getComments);

module.exports = router;