/**
 * Created by zhengliuyang on 2018/6/5.
 */
module.exports = (socket, io) => {
    // console.log('socket 已连接');
    socket.on('sendMessage', (message) => {
        console.log(message)
        io.emit('message', message);
    });
};