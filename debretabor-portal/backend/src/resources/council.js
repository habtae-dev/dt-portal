const { pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'council',
  table: 'council_contents',
  label: 'Council content',
  fields: {
    subcategory: oneOf(['overview', 'structure', 'speaker', 'standing_committees'], { required: true }),
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('content', 'text'),
    image_url: { type: 'url', max: 500 },
    document_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { image: { column: 'image_url' }, document: { column: 'document_url' } },
  publicWhere: 't.is_published = 1',
  filters: { subcategory: 't.subcategory' },
  search: ['title_en', 'title_am', 'content_en', 'content_am'],
  orderBy: 't.created_at ASC'
};
