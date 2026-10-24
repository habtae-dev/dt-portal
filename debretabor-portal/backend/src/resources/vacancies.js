const { str, pair, oneOf } = require('./_fields');

module.exports = {
  name: 'vacancies',
  table: 'vacancies',
  label: 'Vacancy',
  fields: {
    job_code: str(50, { required: true }),
    ...pair('position_title', 'string', { requiredEn: true }),
    department: str(150, { required: true }),
    employment_type: oneOf(['Permanent', 'Contract'], { notNull: true }),
    quantity: { type: 'int', min: 1, notNull: true },
    ...pair('description', 'text'),
    ...pair('qualifications', 'text'),
    document_url: { type: 'url', max: 500 },
    application_place: str(255, { notNull: true }),
    deadline: { type: 'date', required: true },
    status: oneOf(['Open', 'Closed'], { notNull: true })
  },
  files: { document: { column: 'document_url' } },
  filters: { status: 't.status', department: 't.department', employment_type: 't.employment_type' },
  search: ['job_code', 'position_title_en', 'position_title_am', 'department'],
  orderBy: 't.deadline ASC'
};
