exports.health = (req, res) => {
  const uptime = process.uptime();
  const now = new Date();

  const payload = {
    status: 'ok',
    timestamp: now.toISOString(),
    uptime_seconds: Math.floor(uptime),
    service: 'hms-backend',
    version: '0.1.0'
  };

  res.json(payload);
};
