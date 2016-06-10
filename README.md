# koa-session2

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Test coverage][codecov-image]][codecov-url]

Middleware for [Koa2](https://github.com/koajs/koa/tree/v2.x) to get/set session use with custom stores such as Redis or mongodb with [Babel](https://babeljs.io/)

If you are not using babel in your projects, maybe you can try [this version](https://github.com/Secbone/koa-session2/tree/node6) without babel.

## Install
```
npm install koa-session2
```

## Usage
```js
import Koa from "koa";
import session from "koa-session2";

const app = new Koa();

app.use(session({
    key: "SESSIONID",   //default "koa:sess"
}));
```

### Custom Stores

Store.js
```js
import Redis from "ioredis";
import {Store} from "koa-session2";

export default class RedisStore extends Store {
    constructor() {
        super();
        this.redis = new Redis();
    }

    async get(sid) {
        return await this.redis.get(`SESSION:${sid}`);
    }

    async set(session, opts) {
        if(!opts.sid) {
            opts.sid = this.getID(24);
        }
        await this.redis.set(`SESSION:${opts.sid}`, session);
        return opts.sid;
    }

    async destroy(sid) {
        return await this.redis.del(`SESSION:${sid}`);
    }
}
```
main.js
```js
import Koa from "koa";
import session from "koa-session2";
import Store from "./Store.js";

const app = new Koa();

app.use(session({
    store: new Store()
}));

app.use(ctx => {
    let user = ctx.session.user;

    ctx.session.view = "index";
});
```

## Options

Most options based on [cookies](https://github.com/pillarjs/cookies#cookiesset-name--value---options--)

- `key`: a string for store session id in cookie
- `store`: a class for custom store (extend {Store}, func: #get(sid), #set(session, opts), #destory(sid))

- `maxAge`: a number representing the milliseconds from `Date.now()` for expiry
- `expires`: a `Date` object indicating the cookie's expiration date (expires at the end of session by default).
- `path`: a string indicating the path of the cookie (`/` by default).
- `domain`: a string indicating the domain of the cookie (no default).
- `secure`: a boolean indicating whether the cookie is only to be sent over HTTPS (`false` by default for HTTP, `true` by default for HTTPS).
- `httpOnly`: a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript (`true` by default).
- `signed`: a boolean indicating whether the cookie is to be signed (`false` by default). If this is true, another cookie of the same name with the `.sig` suffix appended will also be sent, with a 27-byte url-safe base64 SHA1 value representing the hash of _cookie-name_=_cookie-value_ against the first [Keygrip](https://www.npmjs.com/package/keygrip) key. This signature key is used to detect tampering the next time a cookie is received.
- `overwrite`: a boolean indicating whether to overwrite previously set cookies of the same name (`false` by default). If this is true, all cookies set during the same request with the same name (regardless of path or domain) are filtered out of the Set-Cookie header when setting this cookie.

## License

MIT


[npm-image]: https://img.shields.io/npm/v/koa-session2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-session2
[downloads-image]: http://img.shields.io/npm/dm/koa-session2.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-session2
[travis-image]: https://img.shields.io/travis/Secbone/koa-session2.svg?style=flat-square
[travis-url]: https://travis-ci.org/Secbone/koa-session2
[codecov-image]: https://img.shields.io/codecov/c/github/Secbone/koa-session2.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/Secbone/koa-session2
