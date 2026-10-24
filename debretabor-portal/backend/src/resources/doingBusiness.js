const { pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'business',
  table: 'doing_business',
  label: 'Business guide',
  fields: {
    ...pair('title', 'string', { requiredEn: true }),
    category: oneOf(['Investment Guide', 'Business License', 'Incentives', 'Opportunities'], { required: true }),
    ...pair('content', 'text', { requiredEn: true }),
    document_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { document: { column: 'document_url' } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['title_en', 'title_am', 'content_en', 'content_am'],
  orderBy: 't.created_at DESC'
};
