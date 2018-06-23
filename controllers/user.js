/**
 * Created by zhengliuyang on 2018/6/1.
 */
const UserModel = require('../models/schema/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const cuid = require('cuid');
const fs = require('fs');
const path = require('path');
const uniqueString = require('unique-string');
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
                let webtoken = ctx.request.headers.webtoken;
                let decoded = jwt.verify(webtoken, config.jwtCert);
                UserModel.update({uid: decoded.uid}, {$set: {avator: `/uploads/avator/${fileName}`}}, (error) => {
                   if(error) {
                       return reject({
                           code: 500,
                           msg: 'update avator error!'
                       })
                   }
                    resolve({
                        code: 200,
                        path: `/uploads/avator/${fileName}`,
                        msg: 'upload success!'
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
    }
};