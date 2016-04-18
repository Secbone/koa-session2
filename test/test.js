import Koa from "koa";
import request from "supertest";
import session from "../dist/index.js";

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
})
