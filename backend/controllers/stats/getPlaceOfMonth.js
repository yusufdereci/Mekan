const { getPlaceOfMonth } = require('../../services/statsService');

module.exports = async (req, res) => {
  try {
    const { data, period } = await getPlaceOfMonth();
    if (!data) return res.json({ success: true, data: null, message: 'Not enough data yet.' });
    res.json({ success: true, data, period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
