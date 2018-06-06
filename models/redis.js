/**
 * Created by zhengliuyang on 2018/6/6.
 */
const redis = require("redis");
const config = require('../config/config.json');
const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
});
client.on("connect", () => {
    console.log('redis connected');
});
module.exports = client;