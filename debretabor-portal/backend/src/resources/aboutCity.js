const { pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'about',
  table: 'about_city',
  label: 'About section',
  key: 'category', // one row per category (UNIQUE) -> addressed by category, saved with upsert
  fields: {
    category: oneOf(['history', 'geography', 'community', 'city_administration'], { required: true }),
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('content', 'text', { requiredEn: true }),
    image_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { image: { column: 'image_url' } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  orderBy: 't.id ASC',
  routes: ['list', 'adminList', 'get', 'upsert']
};
