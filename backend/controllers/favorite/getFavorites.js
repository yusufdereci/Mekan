const { getFavorites } = require('../../services/favoriteService');

module.exports = async (req, res) => {
  try {
    const data = await getFavorites(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
