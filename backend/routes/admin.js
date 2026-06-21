const express = require('express');
const router  = express.Router();

const { login, listComments, updateComment, deleteComment, approveComment, suggestReply } = require('../controllers/admin');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const { loginLimiter }                 = require('../middleware/rateLimiter');
const { adminLoginRules, validate }    = require('../middleware/validation');

router.post('/login', loginLimiter, adminLoginRules, validate, login);

router.use(authMiddleware, requireAdmin);

router.get('/comments',                    listComments);
router.put('/comments/:id',                updateComment);
router.delete('/comments/:id',             deleteComment);
router.post('/comments/:id/approve',       approveComment);
router.post('/comments/:id/suggest-reply', suggestReply);

module.exports = router;
