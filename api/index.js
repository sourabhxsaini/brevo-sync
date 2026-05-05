module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'Brevo SMS -> MOBILEPHONE Sync',
    webhook_url: '/api/sync-mobile',
    method: 'POST'
  });
};