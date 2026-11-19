
const pool = require('../config/db');

const COUNTS = {
  news: 'news',
  tenders: 'tenders',
  vacancies: 'vacancies',
  complaints: 'complaints',
  events: 'events',
  noticeboard: 'noticeboard',
  photos: 'photo_gallery',
  videos: 'video_gallery',
  places: 'places',
  business: 'doing_business',
  projects: 'projects',
  council: 'council_contents',
  executive: 'executive_contents',
  subCities: 'sub_cities',
  subscribers: 'subscribers'
};

// Tables used for the monthly line chart.
// These tables must contain a created_at column.
const TREND_TABLES = [
  { table: 'news', label: 'News' },
  { table: 'events', label: 'Events' },
  { table: 'complaints', label: 'Complaints' }
];

const getStats = async (req, res) => {
  try {
    const entries = Object.entries(COUNTS);

    // Count all dashboard tables
    const countQueries = entries.map(([, table]) =>
      pool.query(`SELECT COUNT(*) AS n FROM ${table}`)
    );

    // Count pending complaints
    const pendingQuery = pool.query(`
      SELECT COUNT(*) AS n
      FROM complaints
      WHERE status = 'Pending'
    `);

    // Group complaints by status for the pie chart
    const complaintStatusQuery = pool.query(`
      SELECT status, COUNT(*) AS count
      FROM complaints
      GROUP BY status
      ORDER BY status
    `);

    // Monthly data for the last 12 months
    const trendSql = TREND_TABLES.map(({ table, label }) => `
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        '${label}' AS category,
        COUNT(*) AS total
      FROM ${table}
      WHERE created_at >= DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01'
      )
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `).join(' UNION ALL ');

    const trendQuery = pool.query(trendSql);

    const results = await Promise.all([
      ...countQueries,
      pendingQuery,
      complaintStatusQuery,
      trendQuery
    ]);

    // Build table counts
    const counts = {};

    entries.forEach(([key], index) => {
      counts[key] = Number(results[index][0][0].n);
    });

    // Pending complaints
    const pendingComplaints = Number(
      results[entries.length][0][0].n
    );

    // Complaint status chart
    const complaintStatuses = results[entries.length + 1][0].map(row => ({
      name: row.status || 'Unknown',
      value: Number(row.count)
    }));

    // Raw monthly trend rows
    const trendRows = results[entries.length + 2][0];

    // Create the last 12 month labels
    const monthlyTrend = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0')
      ].join('-');

      monthlyTrend.push({
        month: date.toLocaleString('en-US', {
          month: 'short',
          year: '2-digit'
        }),
        news: 0,
        events: 0,
        complaints: 0,
        monthKey
      });
    }

    // Fill monthly values from database
    trendRows.forEach(row => {
      const month = monthlyTrend.find(
        item => item.monthKey === row.month
      );

      if (month) {
        month[row.category.toLowerCase()] = Number(row.total);
      }
    });

    // Remove internal monthKey before sending response
    const lineChart = monthlyTrend.map(
      ({ monthKey, ...item }) => item
    );

    res.status(200).json({
      success: true,
      data: {
        ...counts,
        pendingComplaints,
        complaintStatuses,
        lineChart
      }
    });

  } catch (error) {
    console.error('Dashboard statistics error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics.'
    });
  }
};

module.exports = { getStats };
