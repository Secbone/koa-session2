import Koa from "koa";
import Router from 'koa-router';
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

        it("set old sessionid should be work", done => {
            let app = new Koa();
            let router = Router();

            app.use(session({
                key: "SESSIONID"
            }));
          
            router.post("/message",ctx => {
                //console.log(typeof ctx.session) // return string
                ctx.session.message = "something"
                ctx.body = ctx.session.message;
            });

            app.use(router.routes(),router.allowedMethods());

             request(app.listen())
            .post("/message")
            //In browser the cookie will be remained old SESSIONID value.
            //Store session will returned string type
            //Error : TypeError: Cannot assign to read only property 'message' of
            .set("cookie","SESSIONID="+Store.prototype.getID(24))
            .expect(200,"something",done);
         
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
