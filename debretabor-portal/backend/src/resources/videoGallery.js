const { str, pair, bool } = require('./_fields');

module.exports = {
  name: 'videos',
  table: 'video_gallery',
  label: 'Video',
  fields: {
    ...pair('title', 'string', { requiredEn: true }),
    ...pair('description', 'text'),
    // an uploaded "video" file fills video_url; otherwise an external (e.g. YouTube) link is required
    video_url: { type: 'url', max: 500, required: true },
    thumbnail_url: { type: 'url', max: 500 },
    category: str(100, { notNull: true }),
    is_published: bool()
  },
  files: {
    video: { column: 'video_url' },
    thumbnail: { column: 'thumbnail_url' }
  },
  publicWhere: 't.is_published = 1',
  filters: { category: 't.category' },
  search: ['title_en', 'title_am', 'description_en', 'description_am'],
  orderBy: 't.created_at DESC'
};
