const { getPlaceStats } = require('../../services/statsService');

module.exports = async (req, res) => {
  try {
    const data = await getPlaceStats(req.params.placeId);
    res.json({ success: true, data: { placeId: req.params.placeId, ...data } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
