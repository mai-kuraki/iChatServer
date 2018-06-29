/**
 * Created by zhengliuyang on 2018/6/1.
 */
const UserModel = require('../models/schema/user');
const NoticeModel = require('../models/schema/notice');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const cuid = require('cuid');
const fs = require('fs');
const path = require('path');
const uniqueString = require('unique-string');
const redis = require('../models/redis');
const eventEmitter = require('./emitter');

const updateJWT = async (uid, ctx) => {
    let res = await new Promise((resolve, reject) => {
        UserModel.findOne({uid: uid}, (error, data) => {
            if(!error) {
                let profile = {
                    uid: data.uid,
                    email: data.email,
                    sex: data.sex,
                    nick: data.nick,
                    avator: data.avator,
                    birthday: new Date(data.birthday).getTime(),
                };
                let session = ctx.session;
                let webtoken = jwt.sign(profile, config.jwtCert, { expiresIn: '7days' });
                session[webtoken] = new Date().getTime();
                resolve(webtoken);
            }else {
                console.log(error);
                reject(null);
            }
        })
    });
    return res;
};

module.exports = {
    add: async (ctx) => {
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
        let args = ctx.request.body;
        let res = await new Promise((resolve, reject) => {
            UserModel.findOne({email: args.email}, (error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                if(data) {
                    let password = crypto.createHash('sha1').update(args.password).digest('hex');
                    if(password === data.pass) {
                        let JWTP = updateJWT(data.uid, ctx);
                        JWTP.then((token) => {
                            resolve({code: 200, msg: 'login success!', token: token});
                        }).catch(() => {
                            resolve({code: 500, msg: 'jwt error'});
                        });
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
    all: async (ctx) => {
        let res = await new Promise((resolve, reject) => {
            let decoded = ctx.decoded;
            UserModel.find({uid: {$ne: decoded.uid}},'uid nick avator',(error, data) => {
                if(error) {
                    return reject({code: 500, msg: 'db error'});
                }
                resolve({code: 200, data: data});
            })
        });
        ctx.body = res;
    },
    upload: async (ctx) => {
        const file = ctx.request.files.file;
        const reader = fs.createReadStream(file.path);
        const fileName = `${uniqueString()}.jpg`;
        try{
            fs.accessSync('static');
        }catch (e) {
            fs.mkdirSync('static');
        }
        try{
            fs.accessSync('static/uploads');
        }catch (e) {
            fs.mkdirSync('static/uploads');
        }
        try{
            fs.accessSync('static/uploads/avator');
        }catch (e) {
            fs.mkdirSync('static/uploads/avator');
        }
        const stream = fs.createWriteStream(path.join('static/uploads/avator', fileName));
        let res = await new Promise((resolve, reject) => {
            reader.pipe(stream);
            stream.on('finish', () => {
                let decoded = ctx.decoded;
                UserModel.update({uid: decoded.uid}, {$set: {avator: `/uploads/avator/${fileName}`}}, (error) => {
                   if(error) {
                       return reject({
                           code: 500,
                           msg: 'update avator error!'
                       })
                   }
                   let JWTP = updateJWT(decoded.uid, ctx);
                   JWTP.then((token) => {
                       resolve({
                           code: 200,
                           token: token,
                           path: `/uploads/avator/${fileName}`,
                           msg: 'upload success!'
                       });
                   }).catch(() => {
                       resolve({code: 500, msg: 'jwt error'});
                   });
                });
            });
            stream.on('error', (error) => {
                console.log(error);
                reject({
                    code: 500,
                    msg: 'upload error!'
                });
            });
        });
        ctx.body = res;
    },
    update: async (ctx) => {
        let args = ctx.request.body;
        let decoded = ctx.decoded;
        let res = await new Promise((resolve, reject) => {
            UserModel.update({uid: decoded.uid}, {$set: args}, (error) => {
                if(error) {
                    return reject({
                        code: 500,
                        msg: 'update profile error!'
                    })
                }
                let JWTP = updateJWT(decoded.uid, ctx);
                JWTP.then((token) => {
                    resolve({
                        code: 200,
                        token: token,
                        msg: 'update success!'
                    });
                }).catch(() => {
                    resolve({code: 500, msg: 'jwt error'});
                });
            });
        });
        ctx.body = res;
    },
    search: async (ctx) => {
        let args = ctx.request.query;
        if(!args.q) {
            return ctx.body = {code: 500, msg: 'missing parameters'}
        }
        let res = await new Promise((resolve, reject) => {
            UserModel.find({$or: [
                {email: {$regex: args.q, $options:'i'}},
                {uid: {$regex: args.q}}
            ]},'uid nick avator sex email', (error, data) => {
                if(error) {
                    return reject({
                        code: 500,
                        msg: 'search error!'
                    });
                }
                resolve({
                    code: 200,
                    data: data,
                })
            })
        });
        ctx.body = res;
    },
    profile: async (ctx) => {
        let args = ctx.request.query;
        if(!args.uid && !args.email) {
            return ctx.body = {code: 500, msg: 'missing parameters'}
        }
        let q = {};
        if(args.uid) {
            q.uid = args.uid;
        }
        if(args.email) {
            q.email = args.email;
        }
        let res = await new Promise((resolve, reject) => {
            UserModel.findOne(q,'uid nick avator sex email birthday', (error, data) => {
                if(error) {
                    return reject({
                        code: 500,
                        msg: 'get user error!'
                    });
                }
                resolve({
                    code: 200,
                    data: data,
                })
            })
        });
        ctx.body = res;
    },
    apply: async (ctx) => {
        let args = ctx.request.body;
        let obj = {
            from: args.uid,
            to: args.to,
            type: 1,
            msg: args.msg || '',
        };
        let notice = new NoticeModel(obj);
        let res = await new Promise((resolve, reject) => {
            notice.save((err) => {
                if(err) {
                    return reject({
                        code: 500,
                        msg: 'save error!'
                    })
                }
                resolve({
                    code: 200,
                })
            });
        });
        redis.get(args.to, (error, reply) => {
            // console.log(reply)
            if(reply) {

            }
            eventEmitter.emit('notice', obj)
        });
        ctx.body = res;
    }
};