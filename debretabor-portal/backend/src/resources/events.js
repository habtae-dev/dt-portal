const { str, pair, bool } = require('./_fields');

module.exports = {
  name: 'events',
  table: 'events',
  label: 'Event',
  fields: {
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('description', 'text'),
    event_date: { type: 'date', required: true },
    start_time: { type: 'time' },
    end_time: { type: 'time' },
    location_en: str(255, { required: true }),
    location_am: str(255),
    image_url: { type: 'url', max: 500 },
    is_published: bool()
  },
  files: { image: { column: 'image_url' } },
  publicWhere: 't.is_published = 1',
  search: ['title_en', 'title_am', 'location_en', 'location_am'],
  orderBy: 't.event_date ASC',
  validate: (r) => (r.start_time && r.end_time && r.end_time < r.start_time ? { end_time: 'end_time must not be before start_time' } : {})
};
