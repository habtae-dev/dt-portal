const { str, pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'executive',
  table: 'executive_contents',
  label: 'Executive content',
  fields: {
    category: oneOf(['mayor', 'cabinet', 'structure', 'bureau'], { required: true }),
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('person_name', 'string', { max: 150 }),
    ...pair('position', 'string', { max: 150 }),
    ...pair('content', 'text'),
    image_url: { type: 'url', max: 500 },
    document_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { image: { column: 'image_url' }, document: { column: 'document_url' } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['title_en', 'title_am', 'person_name_en', 'person_name_am', 'position_en', 'position_am'],
  orderBy: 't.created_at ASC'
};
