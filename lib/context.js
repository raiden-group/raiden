'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('./log');
const Middleware = require('./middleware');
const utils = require('./utils');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.json');
const Catch = require('./catch');

class Context {
  constructor(cmd, initConfig = {}) {
    // 运行时数据
    this.command = cmd;
    this.allConfig = {};// 所有配置
    this.config = initConfig || {} // 当前运行指令配置文件
    this.fs = fs;
    // 工具
    this.utils = utils;
    this.log = log;
    this.cwd = process.cwd();
    // 文件路径相关
    this.configPath = path.resolve(this.cwd,'./'+ rdconfig['RD_CONFIG_NAME'] ); //配置文件路径
    // 运行文件夹内 package.json
    this.packagePath = path.resolve(this.cwd, './package.json');
    this.package = require(this.packagePath); 
      // 获取配置文件
    this.getAllConfig = async function() {
      if(!fs.pathExistsSync(this.configPath)) {
        this.log.error('请配置， 配置文件');
        process.exit(1);
      }
      this.allConfig = require(this.configPath);
    }
    // 检查配置文件中是否有配置指令
    this.getConfig = async function() {
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
    this.initConfigMiddleware = async function() {
      this.middleware = await Middleware(this, this.config);
    }
    // 根据中间配置列表生成遍历器
    this.createGenerate = function *() {
      const { middlewarelist } = this.middleware;
      for (let mid of middlewarelist) {
        yield mid.run(this, mid.options);
      }
    }
    this.download = async function(pkg) {
      return await Catch.install(pkg, undefined, true);
    }
    // 开始执行中间件
    this.exec = async function() {
      const { value, done } = await this.midController.next();
      if (!done && value) {
        await value;
        await this.exec();
      }
    }
    this.check = async function() {
      if (!fs.pathExistsSync(path.resolve(this.cwd, 'node_modules')))  {
        await child_process.exec(`${rdconfig.RD_NPM} install`);
      }
    }
    // 开始运行
    this.run = async function() {
      await this.check();
      await this.getAllConfig();
      await this.getConfig();
      await this.initConfigMiddleware();
      this.midController = this.createGenerate();
      await this.exec();
    }
    process.env.__MODE__ = '';
  }
}
module.exports = Context;