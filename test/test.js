"use strict"

import Koa from 'koa';
import Router from 'koa-router'
import request from 'supertest'
import session, {Store} from '../dist/index.js'


class CustomStore extends Store {
    constructor() {
        super();
        this.store = {};
        this.set_count = 0
    }

    async get(sid) {
        return this.store[sid];
    }

    async set(session, opts, ctx = {}) {
        this.set_count += 1
        // for test the ctx param
        if(ctx.test_id) return ctx.test_id

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
        })
        .get('/updateSession', ctx => {
            ctx.session.user = 'john';
            ctx.body = ctx.session;
        })
        .get('/clearSession', ctx => {
            ctx.session = null;
            ctx.body = 'ok';
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
         * @desc It should work when update session value
         */
        it("should work when update session", done => {
            request(server)
            .get('/updateSession')
            .set('cookie', cookie)
            .expect(200, (err, res) => {
                if(err) done(err);
                if(res.body.user == 'john') done();
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


        // get new cookie id
        cookie = "koa:sess=" + Store.prototype.getID(24)

        /**
         * @desc It should work when request with an old or not exists cookie
         */
        it("set old sessionid should be work", done => {

            request(server)
            .get("/setSession")
            .set("cookie", cookie)
            .expect(200, (err, res) => {
                if(res.body.user == 'tom') done();
            });

        });

        it("should work when clear session by setting null value", done => {
            request(server)
            .get('/clearSession')
            .set('cookie', cookie)
            .expect(200, (err, res) => {
                // should set cookie to empty
                if(/koa:sess=;/.test(res.header['set-cookie'][0])) done();
            });
        });
    });



    describe("when use custom store", () => {
        const app = new Koa();
        const router = new Router();
        const store = new CustomStore();

        app.use(session({
            store,
        }));

        router.get('/set', ctx => {
            ctx.session.user = {name: "tom"};
            ctx.body = 'done';
        })
        .get('/change', ctx => {
            ctx.session.user = {name: "jim"};
            ctx.body = 'changed';
        })
        .get('/clear', ctx => {
            ctx.session = {};
            ctx.body = 'cleared';
        });

        app.use(router.routes());
        const server = app.listen();

        let cookie;

        /**
         * @desc It should work when use custom store
         */
        it("should work", done => {
            request(server)
            .get("/set")
            .expect(200, (err, res) => {
                if(!err) done();
                cookie = res.header['set-cookie'][0];
            });
        });

        /**
         * @desc It should destory old session when set an empty object
         */
        it("should work when set an empty object", done => {
            request(server)
            .get('/clear')
            .set('cookie', cookie)
            .expect(200, (err, res) => {
                if(err) done(err);

                let sid = cookie[0].split(';')[0].split('=')[1];
                if(typeof store.store[sid] === 'undefined') done();

            });
        });

        /**
         * @desc It should update the old session when set new one
         */
        it("should work when update old session", done => {

            request(server)
            .get("/set")
            .expect(200, (err, res) => {
                let cookie = res.header['set-cookie'];
                let sid = cookie[0].split(';')[0].split('=')[1];

                // change session to refresh
                request(server).get("/change")
                .set("Cookie", cookie)
                .expect(200, (err, res) => {
                    // the old session id should be updated
                    if(store.store[sid].user.name == 'jim') done();
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

        router.get("/set", ctx => {
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
            .get("/set")
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
            .get("/set")
            .set("Cookie", cookie)
            .expect(200)
            .end((err, res) => {
                // cookie should reset when session is not found in store
                let sid = cookie[0].split(';')[0].split('=')[1];

                if (Object.keys(store.store).length === 1 &&
                    store.store[sid].user.name == 'tom') {
                  return done();
                }
                done(new Error("error resetting cookie"));
            });

        });
    });

    describe("when pass the context to the session store", () => {
        let app = new Koa();
        let router = new Router();
        let store = new CustomStore();

        app.use(session({
            store
        }));

        router.get("/set", ctx => {
            ctx.test_id = 'the_id_in_ctx'
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
            .get("/set")
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // if the session id is the preset one
                if(res.header["set-cookie"][0].includes('the_id_in_ctx')) done()
            });

        });
    })


    describe("when refresh session", () => {
        let app = new Koa();
        let router = new Router();
        let store = new CustomStore();

        app.use(session({
            store,
            maxAge: 5000,
        }));

        router.get("/set", ctx => {
            ctx.session.user = {name: "tom"};
            ctx.body = "done";
        })
        .get("/refresh", ctx => {
            ctx.session.refresh()
            ctx.body = 'refreshed'
        })

        app.use(router.routes())

        const server = app.listen();

        /**
         * @desc It should work
         */
        it("should work", done => {

            // set a new session
            request(server)
            .get("/set")
            .expect(200, (err, res) => {
                let cookie = res.header['set-cookie'];

                // refresh session
                request(server).get("/refresh")
                .set("Cookie", cookie)
                .expect(200, (err, res) => {
                    // the set function should be called and the set_count should be 2
                    if(store.set_count == 2) done()
                });
            });

        });
    })

});
