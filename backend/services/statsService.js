const Comment          = require('../models/Comment');
const { calcPlaceStats } = require('./aiService');

function buildTimeline(comments) {
  const months = {};
  const now    = new Date();

  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: key, count: 0, satisfactionSum: 0 };
  }

  comments.forEach(c => {
    const d   = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].count++;
      months[key].satisfactionSum += c.aiScore?.satisfactionScore ?? 50;
    }
  });

  return Object.values(months).map(m => ({
    month:           m.month,
    count:           m.count,
    avgSatisfaction: m.count > 0 ? Math.round(m.satisfactionSum / m.count) : null
  }));
}

function getBestPlace(comments) {
  const grouped = {};

  comments.forEach(c => {
    if (!grouped[c.placeId]) {
      grouped[c.placeId] = { placeId: c.placeId, placeName: c.placeName, comments: [] };
    }
    grouped[c.placeId].comments.push(c);
  });

  const ranked = Object.values(grouped).map(g => ({
    placeId:   g.placeId,
    placeName: g.placeName,
    ...calcPlaceStats(g.comments)
  }));

  ranked.sort((a, b) => (b.satisfactionPct ?? 0) - (a.satisfactionPct ?? 0));
  return ranked[0] || null;
}

const getPlaceStats = async (placeId) => {
  const comments = await Comment.find({ placeId, isApproved: true })
    .select('rating aiScore createdAt');

  return {
    ...calcPlaceStats(comments),
    timeline: buildTimeline(comments)
  };
};

const MAX_RANKING_PLACES = 50;

const getRanking = async (placeIds) => {
  const limitedIds = placeIds.slice(0, MAX_RANKING_PLACES);

  const allComments = await Comment.find({ placeId: { $in: limitedIds }, isApproved: true })
    .select('placeId placeName rating aiScore createdAt');

  const grouped = {};
  allComments.forEach(c => {
    if (!grouped[c.placeId]) {
      grouped[c.placeId] = { placeId: c.placeId, placeName: c.placeName, comments: [] };
    }
    grouped[c.placeId].comments.push(c);
  });

  const ranking = Object.values(grouped).map(g => ({
    placeId:   g.placeId,
    placeName: g.placeName,
    ...calcPlaceStats(g.comments)
  }));

  return ranking.sort((a, b) => (b.satisfactionPct ?? 0) - (a.satisfactionPct ?? 0));
};

const getPlaceOfMonth = async () => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  let comments = await Comment.find({ isApproved: true, createdAt: { $gte: start, $lt: end } })
    .select('placeId placeName rating aiScore createdAt');

  let period = 'this_month';

  if (!comments.length) {
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 1);

    comments = await Comment.find({ isApproved: true, createdAt: { $gte: lastStart, $lt: lastEnd } })
      .select('placeId placeName rating aiScore createdAt');

    period = 'last_month';
  }

  if (!comments.length) return { data: null, period: null };

  return { data: getBestPlace(comments), period };
};

const getTrending = async (limit = 5) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return Comment.aggregate([
    { $match: { isApproved: true, createdAt: { $gte: sevenDaysAgo }, 'aiScore.label': 'positive' } },
    { $group: {
        _id:             '$placeId',
        placeName:       { $first: '$placeName' },
        positiveCount:   { $sum: 1 },
        avgRating:       { $avg: '$rating' },
        avgSatisfaction: { $avg: '$aiScore.satisfactionScore' }
    }},
    { $sort: { positiveCount: -1, avgSatisfaction: -1 } },
    { $limit: limit },
    { $project: {
        placeId:         '$_id',
        placeName:       1,
        positiveCount:   1,
        avgRating:       { $round: ['$avgRating', 1] },
        avgSatisfaction: { $round: ['$avgSatisfaction', 0] },
        _id: 0
    }}
  ]);
};

module.exports = { getPlaceStats, getRanking, getPlaceOfMonth, getTrending };
