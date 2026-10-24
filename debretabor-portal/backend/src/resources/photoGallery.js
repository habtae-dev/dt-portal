const { str, pair, bool } = require('./_fields');

module.exports = {
  name: 'photos',
  table: 'photo_gallery',
  label: 'Photo album',
  fields: {
    ...pair('title', 'string', { requiredEn: true }),
    category: str(100, { notNull: true }),
    is_published: bool()
  },
  files: { images: { column: 'images', multiple: true, max: 10, required: true } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['title_en', 'title_am', 'category'],
  orderBy: 't.created_at DESC'
};
