'use strict';
const log = require('./log');
const rdconfig = require('./.raiden.config.js');
const Catch = require('./catch');

class LineConfig {
    loadConfig = async function () {
        this.spainer = log.ora('load config');
        return new Promise(async (resolve) => {
            const configPath = rdconfig['RD_ONLINE_CONFIG_GIT'];
            await Catch.clone(configPath, undefined, false);
            resolve();
            this.spainer.succeed('load config complete');
        })
    }

}

module.exports = new LineConfig();