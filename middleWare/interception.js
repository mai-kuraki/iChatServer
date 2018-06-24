const config = require('../config/config.json');
const jwt = require('jsonwebtoken');
async function interception(ctx, next) {
    let allowUrl = ['/user/add', '/user/login', '/user/logout'];
    let url = ctx.request.url;
    if(allowUrl.indexOf(url) > -1) {
        await next();
    }else {
        let session = ctx.session;
        let webtoken = ctx.request.headers.webtoken;
        if(webtoken && session[webtoken]) {
            let decoded = jwt.verify(webtoken, config.jwtCert);
            if(decoded) {
                ctx.decoded = decoded;
                await next();
            }else {
                ctx.body = {
                    code: 502,
                    msg: 'invalid webtoken'
                };
            }
        }else {
            ctx.body = {
                code: 502,
                msg: 'invalid user'
            };
        }
    }
};

module.exports = interception;