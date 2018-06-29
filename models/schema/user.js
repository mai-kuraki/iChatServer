/**
 * Created by zhengliuyang on 2018/6/1.
 */
const {Schema} = require('mongoose');
const {mongoClient} = require('../mongo');

const userSchema = new Schema(
    {
        uid: String, //uid
        email: String, //邮箱
        sex: Number, //性别 0:未知 1:男 2:女
        pass: String, //密码
        nick: String, //昵称
        avator: String, //邮箱
        birthday: { type: Date, default: Date.now }, //生日
    },
);

const UserModel = mongoClient.model('UserModel', userSchema, 'user');
module.exports = UserModel;