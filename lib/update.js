
'use strict';
const Catch = require('./catch');
const log = require('./log');

module.exports = async function update() {
    log.info('update start');
    await Catch.clear();
    log.info('update success');
}