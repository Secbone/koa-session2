"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _crypto = require("crypto");

var Store =
/*#__PURE__*/
function () {
  function Store() {
    (0, _classCallCheck2.default)(this, Store);
    this.sessions = new Map();
    this.__timer = new Map();
  }

  (0, _createClass2.default)(Store, [{
    key: "getID",
    value: function getID(length) {
      return (0, _crypto.randomBytes)(length).toString('hex');
    }
  }, {
    key: "get",
    value: function get(sid) {
      if (!this.sessions.has(sid)) return undefined; // We are decoding data coming from our Store, so, we assume it was sanitized before storing

      return JSON.parse(this.sessions.get(sid));
    }
  }, {
    key: "set",
    value: function set(session) {
      var _this = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$sid = _ref.sid,
          sid = _ref$sid === void 0 ? this.getID(24) : _ref$sid,
          maxAge = _ref.maxAge;

      // Just a demo how to use maxAge and some cleanup
      if (this.sessions.has(sid) && this.__timer.has(sid)) {
        var __timeout = this.__timer.get(sid);

        if (__timeout) clearTimeout(__timeout);
      }

      if (maxAge) {
        this.__timer.set(sid, setTimeout(function () {
          return _this.destroy(sid);
        }, maxAge));
      }

      try {
        this.sessions.set(sid, JSON.stringify(session));
      } catch (err) {
        console.log('Set session error:', err);
      }

      return sid;
    }
  }, {
    key: "destroy",
    value: function destroy(sid) {
      this.sessions.delete(sid);

      this.__timer.delete(sid);
    }
  }]);
  return Store;
}();

exports.default = Store;