const { getTrending } = require('../../services/statsService');

module.exports = async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 5);
    const data  = await getTrending(limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
