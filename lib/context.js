const path = require('path');
const fs = require('fs');
const log = require('./log');
const Middleware = require('./middleware');
const utils = require('./utils');
const CONFIG_NAME = 'config.js';
const child_process = require('child_process');
function Context (cmd) {

  // 文件路径相关
  this.cwd = process.cwd();
  this.configPath = path.resolve(this.cwd,'./'+ CONFIG_NAME );
  // 运行文件夹内 package.json
  this.package = require(path.resolve(this.cwd, './package.json')); 
  // 运行时数据
  this.command = cmd;
  this.logLevel = 'info'; // info || info
  this.allConfig = {};// 所有配置
  this.config = {} // 当前运行指令配置文件
  // 获取配置文件
  this.getAllConfig = async function() {
    if(!fs.existsSync(this.configPath)) this.log.error('请配置， 配置文件');
    this.allConfig = require(this.configPath);
  }
  // 检查配置文件中是否有配置指令
  this.getConfig = async function() {
    if (this.allConfig && this.command) {
      const curCmd = this.command.cmd;
      this.config = this.allConfig[curCmd];
      if (!this.config) this.log.error('请配置:' + curCmd + "指令配置");
    }
  }
  // 初始化配置的中间件列表
  this.initConfigMiddleware = async function() {
    this.middleware = await Middleware(this, this.config);
  }
  // 根据中间配置列表生成遍历器
  this.createGenerate = function *() {
    const { middlewarelist } = this.middleware;
    for (var mid of middlewarelist) {
      yield mid.run(this, mid.options);
    }
  }
  // 开始执行中间件
  this.exec = async function() {
    const { value, done } = await this.midController.next();
    if (!done && value) {
      await value;
      await this.exec();
    }
  }
  // 开始运行
  this.run = async function() {
    await this.getAllConfig();
    await this.getConfig();
    await this.initConfigMiddleware();
    this.midController = this.createGenerate();
    await this.exec();
  }
  this.log.init(this);
  return this;
}
Context.prototype = {
  // 工具
  utils: utils,
  log,
  download: async function(package) {
    return await new Promise((resolve) => {
      this.log.debug('开始下载包')
      child_process.exec('npm uninstall react', {
        cwd: this.cwd
      }, (error) => {
        console.log(error);
        if ( error ) {
          this.log.error("下载失败", error);
          resolve(false);
          return ;
        }
        resolve(true);
      });
    })
  }
}

module.exports = Context;
