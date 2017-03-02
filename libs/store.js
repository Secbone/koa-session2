"use strict"

const { randomBytes } = require('crypto');

class Store {
    constructor() {
        this.session = {};
    }

    decode(string) {
        if(typeof string !== "string") return "";

        let session = "";

        try{
            session = JSON.parse(new Buffer(string, "base64").toString());
        } catch(e) {}

        return session;
    }

    encode(obj) {
        return new Buffer(obj).toString("base64");
    }

    getID(length) {
        return randomBytes(length).toString('hex');
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

module.exports = Store;
