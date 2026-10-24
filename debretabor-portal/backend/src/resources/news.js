const { str, text, pair, bool } = require('./_fields');

module.exports = {
  name: 'news',
  table: 'news',
  label: 'News article',
    fields: {
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('content', 'text', { requiredEn: true }),
    category: str(100, { notNull: true }),
    is_published: bool()
  },
  files: { images: { column: 'images', multiple: true, max: 5 } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['title_en', 'title_am', 'content_en', 'content_am'],
  orderBy: 't.created_at DESC',
  beforeCreate: (values, req) => { values.author_id = req.user.id; }
};
