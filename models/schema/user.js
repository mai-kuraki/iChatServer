/**
 * Created by zhengliuyang on 2018/6/1.
 */
const {Schema} = require('mongoose');
const {mongoClient} = require('../mongo');

const userSchema = new Schema(
    {
        email: String,
        sex: Number,
        pass: String,
        nick: String,
        avator: String,
        birthday: { type: Date, default: Date.now },
    },
);

const UserModel = mongoClient.model('UserModel', userSchema, 'user');
module.exports = UserModel;