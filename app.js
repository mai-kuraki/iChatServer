/**
 * Created by zhengliuyang on 2018/6/1.
 */
const session = require('koa-generic-session');
const redis = require('redis');
const redisStore = require('koa-redis');
const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');
const config = require('./config/config.json');
const userRoute = require('./routes/user');
const interception = require('./middleWare/interception');
const socketHandle = require('./controllers/socket');
const socketioJwt = require('socketio-jwt');
const static = require('koa-static');
const app = new Koa();
const redisClient = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.sessionDB
});
redisClient.auth(config.redis.password);
const store = redisStore({
    client: redisClient,
});
app.keys = ['session key'];
app.use(session({
    store: store,
}));

store.on('connect', () => {
    console.log('redis store is connected')
});

app.use(static('static'));

app.use(koaBody({
    multipart: true,
    formLimit: '5mb'
}));

app.use(interception);

app.use(router.routes());

router.use(userRoute.routes());

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
    // pingInterval: 20000,
    // pingTimeout: 40000
    serveClient: false ,
    transports: ['websocket', 'polling']
});
io.sockets.on('connection', socketioJwt.authorize({
        secret: config.jwtCert,
        timeout: 15000
    })).on('authenticated', (socket) => {
    socketHandle(socket, io);
});

server.listen(config.port, () => {
    console.log(`app listen on port ${config.port}`);
});