/**
 * Created by zhengliuyang on 2018/6/1.
 */
const UserModel = require('../models/schema/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const cuid = require('cuid');
module.exports = {
    addUser: async (ctx) => {
        let args = ctx.request.body;
        let user = new UserModel({
            uid: `ID_${cuid()}`,
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
        let session = ctx.session;
        let args = ctx.request.body;
        let res = await new Promise((resolve, reject) => {
            UserModel.findOne({email: args.email}, (error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                if(data) {
                    let password = crypto.createHash('sha1').update(args.password).digest('hex');
                    if(password === data.pass) {
                        let profile = {
                            uid: data.uid,
                            email: data.email,
                            sex: data.sex,
                            nick: data.nick,
                            avator: data.avator,
                            birthday: new Date(data.birthday).getTime(),
                        };
                        let webtoken = jwt.sign(profile, config.jwtCert, { expiresIn: '7days' });
                        session[webtoken] = new Date().getTime();
                        resolve({code: 200, msg: 'login success!', token: webtoken});
                    }else {
                        resolve({code: 501, msg: 'email or password error'});
                    }
                }else {
                    resolve({code: 501, msg: 'email not exists'});
                }
            })
        });
        ctx.body = res;
    },
    logout: (ctx) => {
        let webtoken = ctx.request.headers.webtoken;
        let session = ctx.session;
        session[webtoken] = null;
        ctx.body = {
            code: 200,
            msg: 'logout success!'
        }
    },
    getAllUser: async (ctx) => {
        let res = await new Promise((resolve, reject) => {
            let webtoken = ctx.request.headers.webtoken;
            let decoded = jwt.verify(webtoken, config.jwtCert);
            UserModel.find({uid: {$ne: decoded.uid}},'uid nick avator',(error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                resolve({code: 200, data: data});
            })
        });
        ctx.body = res;
    },
};