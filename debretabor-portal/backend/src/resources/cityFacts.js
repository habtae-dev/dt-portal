const { str, pair, bool } = require('./_fields');

// "City at a glance" cards on the home page (area, population, ...). Public sees published rows only.
module.exports = {
  name: 'cityFacts',
  table: 'city_facts',
  label: 'City fact',
  fields: {
    ...pair('label', 'string', { max: 100, requiredEn: true }),
    ...pair('value', 'string', { max: 100, requiredEn: true }),
    note_en: str(150),
    note_am: str(150),
    icon: str(16),
    sort_order: { type: 'int', notNull: true },
    is_published: bool()
  },
  publicWhere: 't.is_published = 1',
  search: ['label_en', 'label_am'],
  orderBy: 't.sort_order ASC, t.id ASC'
};
