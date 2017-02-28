import uid from "uid-safe";

export class Store {
    constructor() {
        this.session = {};
    }

    decode(string) {
        if(!string) return "";

        let session = "";

        try{
            session = new Buffer(string, "base64").toString();
        } catch(e) {}

        return JSON.parse(session);
    }

    encode(obj) {
        return new Buffer(obj).toString("base64");
    }

    getID(length) {
        return uid.sync(length);
    }

    async get(sid) {
        return this.decode(this.session[sid]);
    }

    async set(session, opts) {
        opts = opts || {};
        let sid = opts.sid;
        if(!sid) {
            sid = this.getID(24);
        }

        this.session[sid] = this.encode(JSON.stringify(session));

        return sid;
    }

    async destroy(sid) {
        delete this.session[sid];
    }
}

export default function(opts = {}) {
    opts.key = opts.key || "koa:sess";
    opts.store = opts.store || new Store();

    return async function(ctx, next) {
        let id = ctx.cookies.get(opts.key, opts);

        if(!id) {
            ctx.session = {};
        } else {
            ctx.session = await opts.store.get(id);
            // check session should be a no-null object
            if(typeof ctx.session !== "object" || ctx.session == null) {
                ctx.session = {};
            }
        }

        let old = JSON.stringify(ctx.session);

        await next();

        // if not changed
        if(old == JSON.stringify(ctx.session)) return;

        // clear old session if exists
        if(id) {
            await opts.store.destroy(id);
            id = null;
        }

        // set new session
        if(ctx.session && Object.keys(ctx.session).length) {
            let sid = await opts.store.set(ctx.session, Object.assign({}, opts, {sid: id}));
            ctx.cookies.set(opts.key, sid, opts);
        }
    }
}
