module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    return res.status(200).json({
      status: "ok",
      hasKey: !!process.env.TMDB_API_KEY,
      query: req.query || null,
      url: req.url
    });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};
