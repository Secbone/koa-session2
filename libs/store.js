const { randomBytes } = require('crypto');

class Store {
    constructor() {
        this.sessions = new Map();
        this.__timer = new Map();
    }

    getID(length) {
        return randomBytes(length).toString('hex');
    }

    get(sid) {
        if (!this.sessions.has(sid)) return undefined;
        // We are decoding data coming from our Store, so, we assume it was sanitized before storing
        let sv = this.sessions.get(sid);
        return typeof sv === 'object' ? sv : JSON.parse(sv);
    }

    set(session, { sid =  this.getID(24), maxAge, onlyJSON } = {}) {
        // Just a demo how to use maxAge and some cleanup
        if (this.sessions.has(sid) && this.__timer.has(sid)) {
            const __timeout = this.__timer.get(sid);
            if (__timeout) clearTimeout(__timeout);
        }

        if (maxAge) {
            this.__timer.set(sid, setTimeout(() => this.destroy(sid), maxAge));
        }
        try {
            onlyJSON ? this.sessions.set(sid, JSON.stringify(session)) : this.sessions.set(sid, session);
        } catch (err) {
            console.log('Set session error:', err);
        }

        return sid;
    }

    destroy(sid) {
        this.sessions.delete(sid);
        this.__timer.delete(sid);
    }
}

module.exports = Store;
