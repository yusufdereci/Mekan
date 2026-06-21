const Favorite = require('../models/Favorite');

const getFavorites = (userId) =>
  Favorite.find({ userId }).sort({ createdAt: -1 });

const addFavorite = (userId, { placeId, placeName, placeAddress }) =>
  Favorite.create({ userId, placeId, placeName, placeAddress: placeAddress || '' });

const removeFavorite = (userId, placeId) =>
  Favorite.findOneAndDelete({ userId, placeId });

const isFavorite = async (userId, placeId) => {
  const doc = await Favorite.findOne({ userId, placeId });
  return !!doc;
};

module.exports = { getFavorites, addFavorite, removeFavorite, isFavorite };
