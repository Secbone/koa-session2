const { randomBytes } = require('crypto');

class Store {
    constructor() {
        this.sessions = new Map();
    }

    getID(length) {
        return randomBytes(length).toString('hex');
    }

    get(sid) {
        if (!this.sessions.has(sid)) return undefined;
        // We are decoding data coming from our Store, so, we assume it was sanitized before storing
        return JSON.parse(this.sessions.get(sid));
    }

    set(session, { sid =  this.getID(24), maxAge } = {}) {
        // Just a demo how to use maxAge and some cleanup
        if (this.sessions.has(sid)) {
            const { __timeout } = this.sessions.get(sid);
            if (__timeout) clearTimeout(__timeout);
        }

        if (maxAge) session.__timeout = setTimeout(() => this.destroy(sid), maxAge);
        try {
            // JSON.stringify throws on some conditional, such as circular reference
            this.sessions.set(sid) = JSON.stringify(session);
        } catch (err) {}
        
        return sid;
    }

    destroy(sid) {
        this.sessions.delete(sid);
    }
}

module.exports = Store;
