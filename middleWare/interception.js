async function interception(ctx, next) {
    let allowUrl = ['/user/add', '/user/login', '/user/logout'];
    let url = ctx.request.url;
    if(allowUrl.indexOf(url) > -1) {
        await next();
    }else {
        await next();
        // let session = ctx.session;
        // let webtoken = ctx.request.headers.webtoken;
        // if(webtoken && session[webtoken]) {
        //     await next();
        // }else {
        //     ctx.body = {
        //         code: 502,
        //         msg: 'invalid user'
        //     };
        // }
    }
};

module.exports = interception;