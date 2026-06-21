const { getRanking } = require('../../services/statsService');

module.exports = async (req, res) => {
  try {
    const { placeIds } = req.query;
    if (!placeIds) return res.status(400).json({ success: false, message: 'placeIds parameter is required' });

    const idList = placeIds.split(',').map(s => s.trim()).filter(Boolean);
    const data   = await getRanking(idList);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
