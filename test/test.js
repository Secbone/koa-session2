"use strict"

const Koa = require('koa');
const Router = require('koa-router');
const request = require('supertest');
const session = require('../index.js');
const {Store} = session;


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

    async destroy(sid) {
        delete this.store[sid];
    }
}

describe("koa-session2", () => {
    describe("when use default store", () => {
        let app = new Koa();
        let router = new Router();

        app.use(session({
            maxAge: 5000,
        }));

        router.get('/setSession', ctx => {
            ctx.session.user = "tom";
            ctx.body = ctx.session;
        })
        .get('/getSession', ctx => {
            ctx.body = ctx.session;
        });

        app.use(router.routes());

        const server = app.listen();

        let cookie = '';

        /**
         * @desc It should work when use default session store
         */
        it("should work", done => {
            request(server)
            .get("/setSession")
            .expect(200, (err, res) => {
                if(!err) done();
                // store cookie
                cookie = res.header['set-cookie'][0];
            });
        });

        /**
         * @desc It should set cookies in response headers
         */
        it("should set cookies", done => {
            if(/koa:sess/.test(cookie)) done();
        });

        /**
         * @desc It should get the correct session value when use coockie
         */
        it("should get the correct session", done => {
            request(server)
            .get('/getSession')
            .set('cookie', cookie)
            .expect(200, (err, res) => {
                if(err) done(err);
                if(res.body.user == 'tom') done();
            });
        });

        /**
         * @desc It should work when session expired
         */
        it("should work when session expired", function(done) {
            this.timeout(8000);

            // request after session's maxAge(5000)
            setTimeout(() => {
                request(server)
                .get('/getSession')
                .set('cookie', cookie)
                .expect(200, (err, res) => {
                    if(typeof res.body.user == 'undefined') done();
                });
            }, 6000);
        });

        /**
         * @desc It should get different cookie when multiple clients access
         */
        it("should work when multiple clients access", done => {

            request(server)
            .get("/setSession")
            .end((err_1, res_1) => {
                let cookie_1 = res_1.header['set-cookie'];

                // when a new client without cookie access server
                // should set a new session and new cookie to the client
                // not overwrite the old

                request(server)
                .get("/setSession")
                .end((err_2, res_2) => {
                    let cookie_2 = res_2.header['set-cookie'];

                    if(cookie_1 != cookie_2) done();
                });
            });

        });

        /**
         * @desc It should work when request with an old or not exists cookie
         */
        it("set old sessionid should be work", done => {

            request(server)
            .get("/setSession")
            .set("cookie", "koa:sess=" + Store.prototype.getID(24))
            .expect(200, (err, res) => {
                if(res.body.user == 'tom') done();
            });

        });
    });



    describe("when use custom store", () => {
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

        const server = app.listen();

        /**
         * @desc It should work when use custom store
         */
        it("should work", done => {
            request(server)
            .get("/")
            .expect(200, done);
        });
    });

    describe("when session changed", () => {
        let app = new Koa();
        let router = new Router();
        let store = new CustomStore();
        app.use(session({
            store,
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

        const server = app.listen();

        /**
         * @desc It should destroy the old session when set new one
         */
        it("should destroy old session", done => {

            request(server)
            .get("/set")
            .expect(200, (err, res) => {
                let cookie = res.header['set-cookie'];
                let sid = cookie[0].split(';')[0].split('=')[1];

                // change session to refresh
                request(server).get("/change")
                .set("Cookie", cookie)
                .expect(200, (err, res) => {
                    // the old session id should be destroyed
                    if(typeof store.store[sid] == 'undefined') done();
                });
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

        const server = app.listen();

        /**
         * @desc It should work
         */
        it("should work", done => {

            request(server)
            .get("/setandforget")
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();

                // save cookie for next test
                cookie = res.header["set-cookie"];
                // clear the store
                for (let key in store.store) {
                  delete store.store[key];
                }
            });

        });

        /**
         * @desc It should work even if store cleared
         */
        it("should work even if store cleared", done => {

            request(server)
            .get("/setandforget")
            .set("Cookie", cookie)
            .expect(200)
            .end((err, res) => {
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
