const express = require('express');
const createCrud = require('./createCrud');
const upload = require('../middleware/upload');
const { verifyToken, verifyEditor } = require('../middleware/authMiddleware');

const ALL = ['list', 'adminList', 'get', 'create', 'update', 'remove'];

// Standard REST surface for one resource:
//   GET    /              public list (published / active only)  ?search= &<filters> &limit= &page=
//   GET    /admin/all     every row incl. drafts                 (any signed-in user)
//   GET    /:id           public single
//   POST   /              create                                 (Editor/Admin, multipart or JSON)
//   PUT    /:id           partial update                         (Editor/Admin)
//   DELETE /:id           delete + remove its uploaded files     (Editor/Admin)
// `admin/all` is registered before `/:id` so it is never mistaken for an id.
function buildRouter(config) {
  const router = express.Router();
  const h = createCrud(config);
  const routes = new Set(config.routes || ALL);
  const key = config.key && config.key !== 'id' ? config.key : 'id';
  const parseBody = upload.fields(Object.entries(config.files || {}).map(([name, f]) => ({
    name, maxCount: f.multiple ? (f.max || 10) : 1
  })));

  if (routes.has('list')) router.get('/', h.list);
  if (routes.has('adminList')) router.get('/admin/all', verifyToken, h.adminList);
  if (routes.has('get')) router.get(`/:${key}`, h.getOne);
  if (routes.has('create')) router.post('/', verifyEditor, parseBody, h.create);
  if (routes.has('upsert')) {
    router.post('/', verifyEditor, parseBody, h.upsert);
    router.put(`/:${key}`, verifyEditor, parseBody, h.upsert);
  }
  if (routes.has('update')) router.put(`/:${key}`, verifyEditor, parseBody, h.update);
  if (routes.has('remove')) router.delete(`/:${key}`, verifyEditor, h.remove);
  return router;
}

module.exports = buildRouter;
