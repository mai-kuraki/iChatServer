/**
 * Created by zhengliuyang on 2018/6/1.
 */
const userController = require('../controllers/user');
const router = require('koa-router')({
    prefix: '/user'
});
router.post('/add', userController.add);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/all', userController.all);
router.get('/search', userController.search);
router.get('/profile', userController.profile);
router.post('/upload', userController.upload);
router.put('/update', userController.update);
router.post('/apply', userController.apply);
router.get('/notice', userController.notice);
module.exports = router;