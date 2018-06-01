/**
 * Created by zhengliuyang on 2018/6/1.
 */
const UserModel = require('../models/schema/user');
module.exports = {
    addUser: async (ctx) => {
        let user = new UserModel({
            email: 'exp@163.com',
            sex: 0,
            pass: '123456',
            nick: 'Emily',
            avator: '',
        });
        let res = await new Promise((resolve, reject) => {
            user.save((err) => {
                if (err) {
                    reject(err);
                }else {
                    resolve('save success!');
                }
            });
        });
        ctx.body = res;
    }
};