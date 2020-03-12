const log = require('./log');
const path = require('path');
const fs = require('fs-extra');

module.exports =  function (cmd) {
  try {
    const configPath = path.resolve(__dirname, './.raiden.config.json');
    const config = require(configPath);
    if(typeof cmd === 'string') {
      const list = cmd.split(',');
      for(let i=0, len = list.length; i< len; i++ ) {
        const [key, value] = list[i].split('=');
        if (config[key]) {
          config[key] = value;
        }
      }
      fs.writeFile(configPath, JSON.stringify(config, null, 2));
      log.info('配置成功');
    } else {
      log.info('本地配置:', JSON.stringify(config, null, 2 ))
    }
  } catch(err) {
    log.error(err);
  }
}