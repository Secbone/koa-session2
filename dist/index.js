"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Store = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function () {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    opts.key = opts.key || "koa:sess";
    opts.store = opts.store || new Store();

    return function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(ctx, next) {
            var id, sid;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
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

                            ctx.session = typeof ctx.session === 'string' ? {} : ctx.session;

                        case 9:
                            _context4.next = 11;
                            return next();

                        case 11:
                            if (!(ctx.session == null)) {
                                _context4.next = 16;
                                break;
                            }

                            _context4.next = 14;
                            return opts.store.destory(id);

                        case 14:
                            _context4.next = 20;
                            break;

                        case 16:
                            _context4.next = 18;
                            return opts.store.set(ctx.session, Object.assign(opts, { sid: id }));

                        case 18:
                            sid = _context4.sent;


                            if (sid != id) ctx.cookies.set(opts.key, sid, opts);

                        case 20:
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = exports.Store = function () {
    function Store() {
        _classCallCheck(this, Store);

        this.session = {};
    }

    _createClass(Store, [{
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
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(sid) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
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
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(session, opts) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                opts = opts || {};
                                if (!opts.sid) {
                                    opts.sid = this.getID(24);
                                }

                                this.session[opts.sid] = this.encode(JSON.stringify(session));

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
        key: "destory",
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(sid) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
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

            function destory(_x4) {
                return ref.apply(this, arguments);
            }

            return destory;
        }()
    }]);

    return Store;
}();