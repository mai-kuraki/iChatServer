/**
 * Created by zhengliuyang on 2018/6/1.
 */
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const config = require('./config/config.json');
const userRoute = require('./routes/user');
const interception = require('./middleWare/interception');
const socketHandle = require('./controllers/socket');
const socketioJwt = require('socketio-jwt');
const app = new Koa();
const store = redisStore({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.sessionDB,
});
app.keys = ['session key'];
app.use(session({
    store: store,
}));

store.on('connect', () => {
    console.log('redis store is connected')
});

app.use(bodyParser());

app.use(interception);

app.use(router.routes());

router.use(userRoute.routes());

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
io.sockets.on('connection', socketioJwt.authorize({
        secret: config.jwtCert,
        timeout: 15000
    })).on('authenticated', (socket) => {
    socketHandle(socket, io);
});

server.listen(config.port, () => {
    console.log(`app listen on port ${config.port}`);
});