/**
 * Created by zhengliuyang on 2018/6/1.
 */
const {Schema} = require('mongoose');
const {mongoClient} = require('../mongo');

const noticeSchema = new Schema(
    {
        from: String, //发送人uid
        to: String, //目标uid
        type: Number, //通知种类 1:申请好友
        msg: String, //通知附带信息
        timestamps: { type: Date, default: Date.now }, //发送时间
        handle: { type: Boolean, default: false }, //是否被处理
        result: { type: Number, default: 0 }, //处理结果 0:未处理 1:已通过 3:未通过 4:已忽略
    },
);

const NoticeModel = mongoClient.model('NoticeModel', noticeSchema, 'notice');
module.exports = NoticeModel;