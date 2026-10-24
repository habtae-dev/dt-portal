const { str, pair, bool } = require('./_fields');

module.exports = {
  name: 'sub-cities',
  table: 'sub_cities',
  label: 'Sub-city',
  fields: {
    ...pair('name', 'string', { max: 150, requiredEn: true }),
    ...pair('description', 'text'),
    head_office_location_am: str(255),
    contact_phone: str(50),
    is_active: bool()
  },
  publicWhere: 't.is_active = 1',
  search: ['name_en', 'name_am'],
  orderBy: 't.name_en ASC'
};
