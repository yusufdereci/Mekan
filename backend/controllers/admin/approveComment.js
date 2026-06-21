const Comment = require('../../models/Comment');

module.exports = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.json({ success: true, message: 'Comment approved', data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
