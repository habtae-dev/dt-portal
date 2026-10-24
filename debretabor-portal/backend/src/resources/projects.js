const { pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'projects',
  table: 'projects',
  label: 'Project',
  fields: {
    category: oneOf(['Program', 'Project'], { notNull: true }),
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('description', 'text'),
    status: oneOf(['Planned', 'Ongoing', 'Completed', 'On Hold'], { notNull: true }),
    budget: { type: 'decimal', min: 0 },
    ...pair('location', 'string'),
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    document_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: {
    images: { column: 'images', multiple: true, max: 5 },
    document: { column: 'document_url' }
  },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category', status: 't.status' },
  search: ['title_en', 'title_am', 'description_en', 'description_am'],
  orderBy: 't.created_at DESC',
  validate: (r) => (r.start_date && r.end_date && r.end_date < r.start_date ? { end_date: 'end_date must not be before start_date' } : {})
};
