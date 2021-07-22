'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.io = void 0;

var _parseUrl = _interopRequireDefault(require('parse-url'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var io = require('socket.io-client/dist/socket.io.slim');

exports.io = io;
