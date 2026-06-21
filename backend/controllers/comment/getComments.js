const Comment = require('../../models/Comment');

module.exports = async (req, res) => {
  try {
    const { placeId } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const query = { placeId, isApproved: true };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-ipHash -adminNote -flagReason'),
      Comment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
