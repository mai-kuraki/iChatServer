/**
 * Created by zhengliuyang on 2018/6/1.
 */
const config = require('../config/config.json');
const mongoose = require('mongoose');
const url = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbName}`;
let mongoClient = mongoose.createConnection(url, {
    poolSize: 5,
    reconnectTries: Number.MAX_VALUE
});

mongoClient.on('connected', () => {
   console.log('mongodb connected')
});

mongoClient.on('error', () => {
    console.log('mongodb connect error')
});

mongoClient.on('disconnected', () => {
    console.log('mongodb disconnected')
});

let close = () => {
    mongoClient.close();
};

module.exports = {
    mongoClient: mongoClient,
    close: close,
};