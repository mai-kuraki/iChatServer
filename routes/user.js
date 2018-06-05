/**
 * Created by zhengliuyang on 2018/6/1.
 */
const userController = require('../controllers/user');
const router = require('koa-router')({
    prefix: '/user'
});
router.put('/add', userController.addUser);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
module.exports = router;