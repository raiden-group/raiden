'use strict';
const log = require('./log');
const rdconfig = require('./.raiden.config.js');
const Catch = require('./catch');

class LineConfig {
    loadConfig = async function () {
        this.spainer = log.ora('获取配置信息...');
        return new Promise(async (resolve) => {
            const configPath = rdconfig['RD_ONLINE_CONFIG_GIT'];
            await Catch.clone(configPath, undefined, false);
            resolve();
            this.spainer.succeed('获取配置信息完成');
        })
    }

}

module.exports = new LineConfig();