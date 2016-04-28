import Koa from "koa";
import request from "supertest";
import session, {Store} from "../dist/index.js";


class CustomStore extends Store {
    constructor() {
        super();
        this.store = {};
    }

    async get(sid) {
        return this.store[sid];
    }

    async set(session, opts) {
        if(!opts.sid) {
            opts.sid = this.getID(24);
        }
        this.store[opts.sid] = session;
        return opts.sid;
    }

    async destory(sid) {
        delete this.store[sid];
    }
}

describe("koa-session2", () => {
    describe("when default", () => {
        it("should be work", done => {
            let app = new Koa();
            app.use(session());

            app.use(ctx => {
                ctx.session.user = "tom";
                ctx.body = ctx.session;
            });

            request(app.listen())
            .get("/")
            .expect(200, done);
        });

        it("should set cookies", done => {
            let app = new Koa();
            app.use(session());

            app.use(ctx => {
                ctx.session.message = "something";
                ctx.body = ctx.session;
            });

            request(app.listen())
            .get("/")
            .expect("Set-Cookie", /koa:sess/)
            .expect(200, (err, res) => {
                if(err) done(err);
                let cookie = res.header["set-cookie"].join(";");
                done();
            });
        });
    });

    describe("when use custom store", () => {
        it("should be work", done => {
            let app = new Koa();
            app.use(session({
                store: new CustomStore()
            }));

            app.use(ctx => {
                ctx.session.user = {
                    name: "tom"
                };

                ctx.body = ctx.session;
            });

            request(app.listen())
            .get("/")
            .expect(200, done);
        });
    })
})
