const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true
    },
    placeId: {
      type:     String,
      required: true
    },
    placeName: {
      type:     String,
      required: true,
      trim:     true
    },
    placeAddress: {
      type:    String,
      default: ''
    }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
