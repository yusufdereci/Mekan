const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
      index:   true,
      select:  false
    },
    placeId: {
      type:     String,
      required: [true, 'Place ID is required'],
      index:    true
    },
    placeName: {
      type:      String,
      required:  [true, 'Place name is required'],
      trim:      true,
      maxlength: [200, 'Place name cannot exceed 200 characters']
    },
    comment: {
      type:      String,
      required:  [true, 'Comment text is required'],
      trim:      true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    rating: {
      type:     Number,
      required: [true, 'Rating is required'],
      min:      [1, 'Minimum rating is 1'],
      max:      [5, 'Maximum rating is 5']
    },
    aiScore: {
      sentimentRaw:      { type: Number, default: 0 },
      satisfactionScore: { type: Number, default: 50 },
      label:             { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
      processed:         { type: Boolean, default: false }
    },
    isApproved: {
      type:  Boolean,
      default: false,
      index: true
    },
    isFlagged: {
      type:    Boolean,
      default: false
    },
    flagReason: {
      type:    String,
      enum:    ['profanity', 'spam', 'inappropriate', 'threatening', null],
      default: null
    },
    ipHash: {
      type:   String,
      select: false
    },
    adminNote: {
      type:      String,
      maxlength: 500,
      default:   ''
    }
  },
  { timestamps: true }
);

commentSchema.index({ placeId: 1, isApproved: 1, createdAt: -1 });
commentSchema.index({ isApproved: 1, createdAt: -1 });
commentSchema.index({ isFlagged: 1 });

module.exports = mongoose.model('Comment', commentSchema);
