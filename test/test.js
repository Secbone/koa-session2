import Koa from "koa";
import Router from 'koa-router';
import request from "supertest";
import session, {Store} from "../dist/index.js";


class CustomStore extends Store {
    constructor(done) {
        super();
        this.done = done || function(){};
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

    async destroy(sid) {
        delete this.store[sid];
        this.done();
    }
}

describe("koa-session2", () => {
    describe("when use default store", () => {
        let app = new Koa();
        app.use(session());

        app.use(ctx => {
            ctx.session.user = "tom";
            ctx.body = ctx.session;
        });

        it("should work", done => {
            request(app.listen())
            .get("/")
            .expect(200, done);
        });

        it("should set cookies", done => {
            request(app.listen())
            .get("/")
            .expect("Set-Cookie", /koa:sess/)
            .expect(200, (err, res) => {
                if(err) done(err);
                let cookie = res.header["set-cookie"].join(";");
                done();
            });
        });

        it("should work when multiple clients access", done => {
            let client = request(app.listen());

            client.get("/").end((err_1, res_1) => {
                let cookie_1 = res_1.header['set-cookie'];

                // when a new client without cookie access server
                // should set a new session and new cookie to the client
                // not overwrite the old

                client.get("/").end((err_2, res_2) => {
                    let cookie_2 = res_2.header['set-cookie'];

                    if(cookie_1 != cookie_2) done();
                });
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
        it("should work", done => {
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
    });

    describe("when session changed", () => {
        it("should call destroy", done => {
            let app = new Koa();
            let router = Router();
            app.use(session({
                // when store destroy methed called, done will be called
                store: new CustomStore(done)
            }));

            router.get("/set", ctx => {
                ctx.session.user = {name: "tom"};
                ctx.body = "done";
            })
            .get("/change", ctx => {
                ctx.session.user = {name: "jim"};
                ctx.body = "changed";
            });

            app.use(router.routes())


            let req = request(app.listen());
            req.get("/set").expect(200, function(err, res){
                let cookie = res.header['set-cookie'];
                // change session to refresh
                req.get("/change")
                    .set("Cookie", cookie)
                    .expect(200)
                    .end();
            });
        });
    });

    describe("when session cookie exists but is not in store", () => {
        let app = new Koa();
        let router = new Router();
        let store = new CustomStore();
        let cookie;

        app.use(session({
            store
        }));

        router.get("/setandforget", ctx => {
          ctx.session.user = {name: "tom"};
          ctx.body = "done";
        });

        app.use(router.routes())

        let req = request(app.listen());

        it("should work", done => {
            req.get("/setandforget").expect(200).end((err, res) => {
                if (err) return done(err);
                // save cookie for next test
                cookie = res.header["set-cookie"];
                // clear the store
                for (let key in store.store) {
                  delete store.store[key];
                }
                done();
            });
        });

        it("should work even if store cleared", done => {
            req.get("/setandforget").set("Cookie", cookie).expect(200).end((err, res) => {
                // cookie should reset and old one deleted when
                // not found in store - new sid and old session
                // destroyed
                if (Object.keys(store.store).length === 1 &&
                    cookie[0] !== res.header["set-cookie"][0]) {
                  return done();
                }
                done(new Error("error resetting cookie"));
            });
        });
    });
    
});
