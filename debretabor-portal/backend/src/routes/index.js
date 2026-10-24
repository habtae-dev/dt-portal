const express = require('express');
const buildRouter = require('../crud/crudRouter');
const { verifyToken } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/statsController');

const api = express.Router();

api.use('/auth', require('./authRoutes'));
api.use('/complaints', require('./complaintsRoutes'));
api.use('/subscribers', require('./subscribersRoutes'));
api.get('/stats', verifyToken, getStats);

// mount path -> resource config in ../resources.
// ORDER MATTERS: sub-cities live under /executive, so they are mounted BEFORE /executive
// (otherwise "/executive/sub-cities" would be matched as "/executive/:id").
const MOUNTS = {
  '/executive/sub-cities': 'subCities',
  '/news': 'news',
  '/tenders': 'tenders',
  '/vacancies': 'vacancies',
  '/events': 'events',
  '/noticeboard': 'noticeboard',
  '/photos': 'photoGallery',
  '/videos': 'videoGallery',
  '/places': 'places',
  '/business': 'doingBusiness',
  '/projects': 'projects',
  '/council': 'council',
  '/executive': 'executive',
  '/about': 'aboutCity',
  '/city-facts': 'cityFacts'
};
Object.entries(MOUNTS).forEach(([mount, file]) => api.use(mount, buildRouter(require(`../resources/${file}`))));

api.MOUNTS = MOUNTS; // used by scripts/generateApiDocs.js
module.exports = api;
