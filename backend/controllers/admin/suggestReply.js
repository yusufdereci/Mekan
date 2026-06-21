const Comment = require('../../models/Comment');
const { suggestReply } = require('../../services/geminiService');

module.exports = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const reply = await suggestReply(comment.comment, comment.placeName, comment.rating);

    if (!reply) return res.status(500).json({ success: false, message: 'Failed to generate reply suggestion' });

    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
