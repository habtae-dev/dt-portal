const express = require('express');
const router = express.Router();
const c = require('../controllers/subscribersController');
const { verifyEditor } = require('../middleware/authMiddleware');

// Public (citizens)
router.post('/', c.subscribe);
router.post('/unsubscribe', c.unsubscribe);

// Staff (subscribers' e-mail addresses are personal data: the read-only Viewer role has no access)
router.post('/broadcast', verifyEditor, c.broadcast); // fixed paths before "/:id" routes
router.post('/test', verifyEditor, c.testMail);
router.get('/mail-status', verifyEditor, c.mailStatus);
router.get('/', verifyEditor, c.list);
router.delete('/:id', verifyEditor, c.remove);

module.exports = router;
