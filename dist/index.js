"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Store = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = function () {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    opts.key = opts.key || "koa:sess";
    opts.store = opts.store || new Store();

    return function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
            var id, old, sid;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            id = ctx.cookies.get(opts.key, opts);

                            if (id) {
                                _context4.next = 5;
                                break;
                            }

                            ctx.session = {};
                            _context4.next = 9;
                            break;

                        case 5:
                            _context4.next = 7;
                            return opts.store.get(id);

                        case 7:
                            ctx.session = _context4.sent;

                            ctx.session = typeof ctx.session === "string" ? {} : ctx.session;

                        case 9:
                            old = (0, _stringify2.default)(ctx.session);


                            if (!ctx.session) {
                                ctx.session = {};
                                opts.sid = null;
                            }

                            _context4.next = 13;
                            return next();

                        case 13:
                            if (!(old == (0, _stringify2.default)(ctx.session))) {
                                _context4.next = 15;
                                break;
                            }

                            return _context4.abrupt("return");

                        case 15:
                            if (!id) {
                                _context4.next = 18;
                                break;
                            }

                            _context4.next = 18;
                            return opts.store.destroy(id);

                        case 18:
                            if (!(ctx.session && (0, _keys2.default)(ctx.session).length)) {
                                _context4.next = 23;
                                break;
                            }

                            _context4.next = 21;
                            return opts.store.set(ctx.session, opts);

                        case 21:
                            sid = _context4.sent;

                            ctx.cookies.set(opts.key, sid, opts);

                        case 23:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
        return function (_x6, _x7) {
            return ref.apply(this, arguments);
        };
    }();
};

var _uidSafe = require("uid-safe");

var _uidSafe2 = _interopRequireDefault(_uidSafe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Store = exports.Store = function () {
    function Store() {
        (0, _classCallCheck3.default)(this, Store);

        this.session = {};
    }

    (0, _createClass3.default)(Store, [{
        key: "decode",
        value: function decode(string) {
            if (!string) return "";

            var session = "";

            try {
                session = new Buffer(string, "base64").toString();
            } catch (e) {}

            return JSON.parse(session);
        }
    }, {
        key: "encode",
        value: function encode(obj) {
            return new Buffer(obj).toString("base64");
        }
    }, {
        key: "getID",
        value: function getID(length) {
            return _uidSafe2.default.sync(length);
        }
    }, {
        key: "get",
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(sid) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt("return", this.decode(this.session[sid]));

                            case 1:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function get(_x) {
                return ref.apply(this, arguments);
            }

            return get;
        }()
    }, {
        key: "set",
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(session, opts) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                opts = opts || {};
                                if (!opts.sid) {
                                    opts.sid = this.getID(24);
                                }

                                this.session[opts.sid] = this.encode((0, _stringify2.default)(session));

                                return _context2.abrupt("return", opts.sid);

                            case 4:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function set(_x2, _x3) {
                return ref.apply(this, arguments);
            }

            return set;
        }()
    }, {
        key: "destroy",
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(sid) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                delete this.session[sid];

                            case 1:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function destroy(_x4) {
                return ref.apply(this, arguments);
            }

            return destroy;
        }()
    }]);
    return Store;
}();