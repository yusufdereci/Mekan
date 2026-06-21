const Comment = require('../../models/Comment');
const { reanalyzeIfChanged } = require('../../services/commentService');

module.exports = async (req, res) => {
  try {
    const existing = await Comment.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Comment not found' });

    const updated = await reanalyzeIfChanged(existing, req.body);
    res.json({ success: true, message: 'Comment updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
