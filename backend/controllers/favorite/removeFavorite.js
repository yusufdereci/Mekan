const { removeFavorite } = require('../../services/favoriteService');

module.exports = async (req, res) => {
  try {
    const deleted = await removeFavorite(req.user.id, req.params.placeId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
