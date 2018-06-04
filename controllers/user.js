/**
 * Created by zhengliuyang on 2018/6/1.
 */
const UserModel = require('../models/schema/user');
const crypto = require('crypto');
module.exports = {
    addUser: async (ctx) => {
        let args = ctx.request.body;
        let user = new UserModel({
            email: args.email || '',
            sex: 0,
            pass: crypto.createHash('sha1').update(args.password).digest('hex'),
            nick: args.email.split('@')[0],
            avator: '',
        });
        let emailRes = await new Promise((resolve, reject) => {
            UserModel.findOne({email: args.email}, (error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                if(data) {
                    resolve({code: 501, msg: 'email already exists'});
                }else {
                    resolve({code: 200});
                }
            })
        });
        if(emailRes.code == 200) {
            let res = await new Promise((resolve, reject) => {
                user.save((err) => {
                    if (err) {
                        reject({
                            code: 500,
                            msg: err,
                        });
                    }else {
                        resolve({
                            code: 200,
                            msg: 'save success!',
                        });
                    }
                });
            });
            ctx.body = res;
        }else {
            ctx.body = emailRes;
        }
    },
    login: async (ctx) => {
        let args = ctx.request.body;
        let res = await new Promise((resolve, reject) => {
            UserModel.findOne({email: args.email}, (error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                if(data) {
                    let password = crypto.createHash('sha1').update(args.password).digest('hex');
                    if(password === data.pass) {
                        resolve({code: 200, msg: 'login success!'});
                    }else {
                        resolve({code: 501, msg: 'email or password error'});
                    }
                }else {
                    resolve({code: 501, msg: 'email not exists'});
                }
            })
        });
        ctx.body = res;
    }
};