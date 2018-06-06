/**
 * Created by zhengliuyang on 2018/6/5.
 */
const redis = require('../models/redis');
const handleConnect = (socket) => {
    let uid = socket.decoded_token.uid;
    let socketId = socket.id;
    redis.set(uid, socketId);
    console.log(uid + '----' + socketId);
};

module.exports = (socket, io) => {
    handleConnect(socket);
    socket.on('sendMessage', (message) => {
        // console.log(socket.decoded_token);
        // console.log(message);
        // console.log(message.toUid)
        redis.get(message.toUid, (error, reply) => {
            socket.to(reply).emit('message', message);
        });
    });
    socket.on('disconnect', (reason) => {
        let uid = socket.decoded_token.uid;
        redis.del(uid);
        console.log(`${uid} is disconnect for reason ${reason}`);
    });
};