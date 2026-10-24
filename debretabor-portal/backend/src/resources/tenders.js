const { str, pair, oneOf } = require('./_fields');

module.exports = {
  name: 'tenders',
  table: 'tenders',
  label: 'Tender',
  fields: {
    reference_no: str(100, { required: true }),
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('description', 'text'),
    document_url: { type: 'url', max: 500 },
    submission_place: str(255, { notNull: true }),
    ...pair('submission_instructions', 'text'),
    closing_date: { type: 'datetime', required: true },
    status: oneOf(['Open', 'Closed', 'Awarded'], { notNull: true })
  },
  files: { document: { column: 'document_url' } },
  filters: { status: 't.status' },
  search: ['reference_no', 'title_en', 'title_am', 'description_en', 'description_am'],
  orderBy: 't.created_at DESC'
};
