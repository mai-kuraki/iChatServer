/**
 * Created by zhengliuyang on 2018/6/1.
 */
const userController = require('../controllers/user');
const router = require('koa-router')({
    prefix: '/user'
});
router.put('/add', userController.add);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/all', userController.all);
router.get('/search', userController.search);
router.get('/profile', userController.profile);
router.post('/upload', userController.upload);
router.post('/update', userController.update);
module.exports = router;