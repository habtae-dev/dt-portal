const express = require('express');
const router = express.Router();
const c = require('../controllers/complaintsController');
const { verifyEditor, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public (citizens)
router.post('/submit', upload.privateSingle('attachment'), c.submitComplaint);
router.get('/track/:tracking_code', c.trackComplaint);

// Staff. Complaints contain citizens' phone numbers and documents, so the read-only Viewer role has no access.
router.get('/', verifyEditor, c.getAllComplaints);
router.get('/:id/attachment', verifyEditor, c.downloadAttachment);
router.get('/:id', verifyEditor, c.getComplaintById);
router.put('/:id', verifyEditor, c.updateComplaintStatus);
router.delete('/:id', verifyAdmin, c.deleteComplaint);

module.exports = router;
