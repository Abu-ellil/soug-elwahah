module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    folder: '22222222',
    message: 'Hello from minimal API (isolated folder)',
    timestamp: new Date().toISOString()
  });
};