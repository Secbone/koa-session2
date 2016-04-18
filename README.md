# koa-session2

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

Middleware for Koa2 to get/set session use with custom stores such as Redis or mongodb with Babel

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

    async destory(sid) {
        return await this.redis.del(sid);
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

Most options like [cookies](https://github.com/pillarjs/cookies#cookiesset-name--value---options--)

- `key`: a string for store session id in cookie
- `store`: a class for custom store (extend {Store}, func: #get(sid), #set(session, opts), #destory(sid))

## License

MIT


[npm-image]: https://img.shields.io/npm/v/koa-session2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-session2
[downloads-image]: http://img.shields.io/npm/dm/koa-session2.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-session2
[travis-image]: https://img.shields.io/travis/Secbone/koa-session2.svg?style=flat-square
[travis-url]: https://travis-ci.org/Secbone/koa-session2
