
const log4js = require('log4js');
const ora = require('ora');
const logger = log4js.getLogger();

module.exports = {
  init: function(ctx) {
    logger.level = ctx.logLevel;
  },
  log: console.log,
  error: function(err) {
    logger.error(err);
  },
  info: function(text) {
    logger.info(text);
  },
  warn: function(text) {
    logger.warn(text);
  },
  debug: function(text) {
    logger.debug(text);
  },
}