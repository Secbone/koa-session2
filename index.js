const Store = require('./libs/store.js');

module.exports = (opts = {}) => {
    const { key = "koa:sess", store = new Store() } = opts;

    return async (ctx, next) => {
        let id = ctx.cookies.get(key, opts);

        if(!id) {
            ctx.session = {};
        } else {
            ctx.session = await store.get(id, ctx);
            // check session must be a no-null object
            if(typeof ctx.session !== "object" || ctx.session == null) {
                ctx.session = {};
            }
        }

        const old = JSON.stringify(ctx.session);

        need_refresh = false
        ctx.session.refresh = () => {need_refresh = true}

        await next();

        if(ctx.session && 'refresh' in ctx.session) {
            delete ctx.session.refresh
        }

        // if not changed
        if(!need_refresh && old == JSON.stringify(ctx.session)) return;

        // if is an empty object
        if(ctx.session instanceof Object && !Object.keys(ctx.session).length) {
            ctx.session = null;
        }

        // need clear old session
        if(id && !ctx.session) {
            await store.destroy(id, ctx);
            ctx.cookies.set(key, null);
            return;
        }

        // set/update session
        const sid = await store.set(ctx.session, Object.assign({}, opts, {sid: id}), ctx);
        ctx.cookies.set(key, sid, opts);
    }
}

// Reeexport Store to not use reference to internal files
module.exports.Store = Store;
