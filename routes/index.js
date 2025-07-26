import express from 'express'
import users_router from './users.js';
import documents_router from './documents.js';
let router = express.Router()

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.use('/users', users_router)
router.use('/documents', documents_router)
export default router