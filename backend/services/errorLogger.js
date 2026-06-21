function logError(context, err, meta = {}) {
  const payload = {
    level:   'ERROR',
    context,
    message: err?.message || String(err),
    meta,
    timestamp: new Date().toISOString()
  };
  console.error(JSON.stringify(payload));
}

function logWarn(context, message, meta = {}) {
  const payload = {
    level:   'WARN',
    context,
    message,
    meta,
    timestamp: new Date().toISOString()
  };
  console.warn(JSON.stringify(payload));
}

function logInfo(context, message, meta = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify({ level: 'INFO', context, message, meta, timestamp: new Date().toISOString() }));
  }
}

module.exports = { logError, logWarn, logInfo };
