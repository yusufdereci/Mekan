const Comment = require('../../models/Comment');

module.exports = async (req, res) => {
  try {
    const { status, page: p, limit: l } = req.query;
    const page  = Math.max(1, parseInt(p)  || 1);
    const limit = Math.min(100, parseInt(l) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (status === 'pending')  { filter.isApproved = false; filter.isFlagged = false; }
    if (status === 'approved')   filter.isApproved = true;
    if (status === 'flagged')    filter.isFlagged  = true;

    const [comments, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Comment.countDocuments(filter)
    ]);

    const [pendingCount, flaggedCount, approvedCount] = await Promise.all([
      Comment.countDocuments({ isApproved: false, isFlagged: false }),
      Comment.countDocuments({ isFlagged: true }),
      Comment.countDocuments({ isApproved: true })
    ]);

    res.json({
      success: true,
      data: comments,
      meta: { pendingCount, flaggedCount, approvedCount },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
