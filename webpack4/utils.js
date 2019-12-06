module.exports = {
  isObject: function (o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  },
  isArray: function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  },
  isString: function(s) {
    return Object.prototype.toString.call(s) === '[object String]';
  },
  isFunction: function(f) {
    return Object.prototype.toString.call(f) === '[object Function]';
  },
  isAsync: function (f) {
    return Object.prototype.toString.call(f) === '[object AsyncFunction]';
  },
  isNull: function (o) {
    return o === null || o === undefined;
  }
}