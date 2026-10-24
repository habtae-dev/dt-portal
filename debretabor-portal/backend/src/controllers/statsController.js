const pool = require('../config/db');

// table names are constants here (never user input)
const COUNTS = {
  news: 'news', tenders: 'tenders', vacancies: 'vacancies', complaints: 'complaints', events: 'events',
  noticeboard: 'noticeboard', photos: 'photo_gallery', videos: 'video_gallery', places: 'places',
  business: 'doing_business', projects: 'projects', council: 'council_contents', executive: 'executive_contents',
  subCities: 'sub_cities', subscribers: 'subscribers'
};

// GET /api/stats  (signed-in users) -> one cheap request for the dashboard instead of 13 full list calls
const getStats = async (req, res) => {
  const entries = Object.entries(COUNTS);
  const results = await Promise.all(entries.map(([, table]) => pool.query(`SELECT COUNT(*) AS n FROM ${table}`)));
  const counts = {};
  entries.forEach(([key], i) => { counts[key] = results[i][0][0].n; });
  const [[{ n: pendingComplaints }]] = await pool.query("SELECT COUNT(*) AS n FROM complaints WHERE status = 'Pending'");
  res.status(200).json({ success: true, data: { ...counts, pendingComplaints } });
};

module.exports = { getStats };
