const crypto   = require('crypto');
const Comment  = require('../models/Comment');
const { analyzeCommentWithGemini } = require('./geminiService');

const hashIp = (ip) =>
  crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');

const createComment = async ({ placeId, placeName, comment, rating, ip }) => {
  const aiResult = await analyzeCommentWithGemini(comment);

  const isApproved = !aiResult.isFlagged;

  const newComment = await Comment.create({
    placeId,
    placeName,
    comment,
    rating:   parseInt(rating),
    aiScore: {
      sentimentRaw:      aiResult.sentimentRaw,
      satisfactionScore: aiResult.satisfactionScore,
      label:             aiResult.label,
      processed:         true
    },
    isFlagged:  aiResult.isFlagged,
    flagReason: aiResult.flagReason,
    isApproved,
    ipHash:     hashIp(ip)
  });

  return {
    id:         newComment._id,
    label:      newComment.aiScore.label,
    score:      newComment.aiScore.satisfactionScore,
    source:     aiResult.source,
    isApproved,
    isFlagged:  aiResult.isFlagged
  };
};

const reanalyzeIfChanged = async (existing, { comment, rating, isApproved, adminNote }) => {
  if (comment && comment !== existing.comment) {
    const aiResult      = await analyzeCommentWithGemini(comment);
    existing.comment    = comment;
    existing.aiScore    = { ...aiResult, processed: true };
    existing.isFlagged  = aiResult.isFlagged;
    existing.flagReason = aiResult.flagReason;
  }

  if (typeof isApproved === 'boolean') existing.isApproved = isApproved;
  if (rating)                          existing.rating     = parseInt(rating);
  if (adminNote !== undefined)         existing.adminNote  = adminNote;

  return existing.save();
};

module.exports = { createComment, reanalyzeIfChanged };
