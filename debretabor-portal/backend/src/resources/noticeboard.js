const { str, pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'noticeboard',
  table: 'noticeboard',
  label: 'Notice',
  fields: {
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('notice_body', 'text', { requiredEn: true }),
    target_audience: str(150, { notNull: true }),
    priority: oneOf(['Normal', 'Important', 'Urgent'], { notNull: true }),
    document_url: { type: 'url', max: 500 },
    is_active: bool(),
    expiry_date: { type: 'date', required: true }
  },
  files: { document: { column: 'document_url' } },
  // Public: only active notices that have not expired yet.
  publicWhere: 't.is_active = 1 AND t.expiry_date >= CURDATE()',
  filters: { priority: 't.priority' },
  search: ['title_en', 'title_am', 'notice_body_en', 'notice_body_am'],
  orderBy: "FIELD(t.priority, 'Urgent', 'Important', 'Normal'), t.created_at DESC"
};
