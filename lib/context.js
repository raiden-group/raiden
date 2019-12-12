'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('./log');
const Middleware = require('./middleware');
const utils = require('./utils');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.js');
const Catch = require('./catch');

class Context {
  constructor(cmd, initConfig = {}) {
    // 运行时数据
    this.command = cmd;
    this.allConfig = {};// 所有配置
    this.config = initConfig || {} // 当前运行指令配置文件
    process.env.__MODE__ = '';
  }
  fs = fs
  // 工具
  utils = utils;
  log = log;
  cwd = process.cwd();
  // 文件路径相关
  configPath = path.resolve(this.cwd,'./'+ rdconfig['RD_CONFIG_NAME'] ); //配置文件路径
  // 运行文件夹内 package.json
  package = require(path.resolve(this.cwd, './package.json')); 
  // 获取配置文件
  getAllConfig = async function() {
    if(!fs.pathExistsSync(this.configPath)) {
      this.log.error('请配置， 配置文件');
      process.exit(1);
    }
    this.allConfig = require(this.configPath);
  }
  // 检查配置文件中是否有配置指令
  getConfig = async function() {
    if (this.allConfig && this.command) {
      const curCmd = this.command.cmd;
      this.config = this.allConfig[curCmd];
      if (!this.config) {
        this.log.error('请配置:' + curCmd + "指令配置项");
        process.exit(1);
      }
    }
  }
  // 初始化配置的中间件列表
  initConfigMiddleware = async function() {
    this.middleware = await Middleware(this, this.config);
  }
  // 根据中间配置列表生成遍历器
  createGenerate = function *() {
    const { middlewarelist } = this.middleware;
    for (let mid of middlewarelist) {
      yield mid.run(this, mid.options);
    }
  }
  download = async function(pkg) {
    return await Catch.install(pkg, undefined, true);
  }
  // 开始执行中间件
  exec = async function() {
    const { value, done } = await this.midController.next();
    if (!done && value) {
      await value;
      await this.exec();
    }
  }
  check = async function() {
    if (!fs.pathExistsSync(path.resolve(this.cwd, 'node_modules')))  {
      await child_process.exec(`${rdconfig.RD_NPM} install`);
    }
  }
  // 开始运行
  run = async function() {
    await this.check();
    await this.getAllConfig();
    await this.getConfig();
    await this.initConfigMiddleware();
    this.midController = this.createGenerate();
    await this.exec();
  }
}
module.exports = Context;