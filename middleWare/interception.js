async function interception(ctx, next) {
    let url = ctx.request.url;
    if(url.indexOf('/user/add') > -1 || url.indexOf('/user/login') > -1) {
        next();
    }else {
        let session = ctx.session;
        let webToken = ctx.request.headers.webToken;
        if(webToken && session[webToken]) {
            next();
        }else {
            ctx.body = {
                code: 502,
                msg: 'invalid user'
            }
        }
    }
};

module.exports = interception;