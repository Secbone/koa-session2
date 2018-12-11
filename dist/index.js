"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Store", {
  enumerable: true,
  get: function get() {
    return _store.default;
  }
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _store = _interopRequireDefault(require("./libs/store.js"));

var _default = function _default() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$key = opts.key,
      key = _opts$key === void 0 ? "koa:sess" : _opts$key,
      _opts$store = opts.store,
      store = _opts$store === void 0 ? new _store.default() : _opts$store;
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(ctx, next) {
        var id, old, need_refresh, sess, sid;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                id = ctx.cookies.get(key, opts);

                if (id) {
                  _context.next = 5;
                  break;
                }

                ctx.session = {};
                _context.next = 9;
                break;

              case 5:
                _context.next = 7;
                return store.get(id, ctx);

              case 7:
                ctx.session = _context.sent;

                // check session must be a no-null object
                if ((0, _typeof2.default)(ctx.session) !== "object" || ctx.session == null) {
                  ctx.session = {};
                }

              case 9:
                old = JSON.stringify(ctx.session); // add refresh function

                need_refresh = false;

                ctx.session.refresh = function () {
                  need_refresh = true;
                };

                _context.next = 14;
                return next();

              case 14:
                // remove refresh function
                if (ctx.session && 'refresh' in ctx.session) {
                  delete ctx.session.refresh;
                }

                sess = JSON.stringify(ctx.session); // if not changed

                if (!(!need_refresh && old == sess)) {
                  _context.next = 18;
                  break;
                }

                return _context.abrupt("return");

              case 18:
                // if is an empty object
                if (sess == '{}') {
                  ctx.session = null;
                } // need clear old session


                if (!(id && !ctx.session)) {
                  _context.next = 24;
                  break;
                }

                _context.next = 22;
                return store.destroy(id, ctx);

              case 22:
                ctx.cookies.set(key, null);
                return _context.abrupt("return");

              case 24:
                _context.next = 26;
                return store.set(ctx.session, Object.assign({}, opts, {
                  sid: id
                }), ctx);

              case 26:
                sid = _context.sent;
                ctx.cookies.set(key, sid, opts);

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
};

exports.default = _default;