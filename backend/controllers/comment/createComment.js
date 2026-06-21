const { createComment } = require('../../services/commentService');
const { logError } = require('../../services/errorLogger');

module.exports = async (req, res) => {
  try {
    const { placeId, placeName, comment, rating } = req.body;
    const data = await createComment({ placeId, placeName, comment, rating, ip: req.ip });

    const message = data.isApproved
      ? 'Your review has been published.'
      : 'Your review is under review and will be published shortly.';

    res.status(201).json({ success: true, message, data });
  } catch (err) {
    logError('createComment', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};
