const Sentiment = require('sentiment');
const analyzer  = new Sentiment();

const TR_POSITIVE = [
  'harika', 'mükemmel', 'muhteşem', 'güzel', 'lezzetli', 'enfes', 'şahane',
  'iyi', 'temiz', 'hızlı', 'sıcak', 'cana yakın', 'başarılı', 'kaliteli',
  'tavsiye', 'beğendim', 'sevdim', 'tekrar', 'süper', 'memnun', 'taze',
  'nezaket', 'ilgili', 'profesyonel', 'şık'
];
const TR_NEGATIVE = [
  'berbat', 'rezalet', 'kötü', 'iğrenç', 'soğuk', 'bayat', 'yavaş',
  'pahalı', 'kirli', 'pis', 'ilgisiz', 'kabalık', 'kaba', 'gürültülü',
  'sıkışık', 'beklettiler', 'tatsız', 'beğenmedim', 'şikayet', 'sorunlu',
  'hayal kırıklığı', 'formatsız', 'özensiz'
];

const trLexicon = {};
TR_POSITIVE.forEach(w => (trLexicon[w] = 3));
TR_NEGATIVE.forEach(w => (trLexicon[w] = -3));

const PROFANITY_LIST = [
  'orospu', 'siktir', 'sikeyim', 'sikerim', 'amk', 'göt', 'piç', 'salak', 'aptal', 'mal',
  'gerizekalı', 'bok', 'kahpe', 'oç'
];

function analyzeComment(text) {
  if (!text || typeof text !== 'string') {
    return { sentimentRaw: 0, satisfactionScore: 50, label: 'neutral', isFlagged: false, flagReason: null };
  }

  const lower = text.toLowerCase();
  const hasProfanity = PROFANITY_LIST.some(word => lower.includes(word));
  const words = lower.split(/\s+/);
  const uniqueRatio = new Set(words).size / words.length;
  const isSpam = words.length > 8 && uniqueRatio < 0.3;

  const result = analyzer.analyze(text, { extras: trLexicon });
  const raw = Math.max(-1, Math.min(1, result.comparative));
  const satisfactionScore = Math.round((raw + 1) / 2 * 100);

  let label = 'neutral';
  if (raw > 0.1)  label = 'positive';
  if (raw < -0.1) label = 'negative';

  return {
    sentimentRaw: parseFloat(raw.toFixed(4)),
    satisfactionScore,
    label,
    processed: true,
    isFlagged: hasProfanity || isSpam,
    flagReason: hasProfanity ? 'profanity' : isSpam ? 'spam' : null
  };
}

function calcPlaceStats(comments) {
  if (!comments || comments.length === 0) {
    return { satisfactionPct: null, avgRating: null, totalReviews: 0, positiveCount: 0, negativeCount: 0 };
  }

  const totalReviews  = comments.length;
  const avgRating     = comments.reduce((s, c) => s + c.rating, 0) / totalReviews;
  const positiveCount = comments.filter(c => c.aiScore?.label === 'positive').length;
  const negativeCount = comments.filter(c => c.aiScore?.label === 'negative').length;
  const avgAI         = comments.reduce((s, c) => s + (c.aiScore?.satisfactionScore ?? 50), 0) / totalReviews;
  const starPct       = ((avgRating - 1) / 4) * 100;
  const posPct        = (positiveCount / totalReviews) * 100;
  const satisfactionPct = Math.round(avgAI * 0.4 + starPct * 0.4 + posPct * 0.2);

  return {
    satisfactionPct,
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews,
    positiveCount,
    negativeCount
  };
}

module.exports = { analyzeComment, calcPlaceStats };
