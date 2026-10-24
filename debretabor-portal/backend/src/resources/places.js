const { pair, bool, oneOf } = require('./_fields');

module.exports = {
  name: 'places',
  table: 'places',
  label: 'Place',
  fields: {
    ...pair('name', 'string', { requiredEn: true }),
    category: oneOf(['Park', 'Monument', 'Museum'], { required: true }),
    ...pair('description', 'text'),
    ...pair('location', 'string'),
    google_maps_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { images: { column: 'images', multiple: true, max: 5 } },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['name_en', 'name_am', 'description_en', 'description_am'],
  orderBy: 't.created_at DESC'
};
