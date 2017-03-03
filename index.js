const Store = require('./libs/store.js');

module.exports = (opts = {}) => {
    const { key = "koa:sess", store = new Store() } = opts;

    return async (ctx, next) => {
        let id = ctx.cookies.get(key, opts);

        if(!id) {
            ctx.session = {};
        } else {
            ctx.session = await store.get(id);
            // check session must be a no-null object
            if(typeof ctx.session !== "object" || ctx.session == null) {
                ctx.session = {};
            }
        }

        const old = JSON.stringify(ctx.session);

        await next();

        // if not changed
        if(old == JSON.stringify(ctx.session)) return;

        // clear old session if exists
        if(id) {
            await store.destroy(id);
            // set it to undefined instead of null to be able to use default parameters at Store
            id = undefined;
        }

        // set new session
        if(ctx.session && Object.keys(ctx.session).length) {
            const sid = await store.set(ctx.session, Object.assign({}, opts, {sid: id}));
            ctx.cookies.set(key, sid, opts);
        }
    }
}

// Reeexport Store to not use reference to internal files
module.exports.Store = Store;