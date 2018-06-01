/**
 * Created by zhengliuyang on 2018/6/1.
 */
const Koa = require('koa');
const router = require('koa-router')();
const config = require('./config/config.json');
const userRoute = require('./routes/user');
const app = new Koa();
app.use(router.routes());
router.use(userRoute.routes());
app.listen(config.port, () => {
    console.log(`app listen on port ${config.port}`);
});