const { addFavorite } = require('../../services/favoriteService');

module.exports = async (req, res) => {
  try {
    const data = await addFavorite(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Added to favorites', data });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This place is already in your favorites' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
