'use strict';

const path = require('path');
const fs = require('fs');
const log = require('./log');

module.exports = async function Middleware (ctx, config) {
  const mid = {};
  // mid.spainer = log.ora('初始化中间件');
  mid.middlewarelist = [] // 中间件列表
  mid.initPackage = async function() {
    for (let middleware of config) {
      const midname = middleware[0], midconfig = middleware[1];
      log.debug(`get middleware: ${midname}`);
      const cb = await mid.getMiddle(midname, midconfig);
      log.debug(`run middleware: ${midname}`);
      const run = async function () {
        return await cb.call(ctx, ctx, midconfig);
      }
      mid.middlewarelist.push({ middleware, run, options: config });
    }
  }
  mid.getMiddle = async function(key, midconfig) {
    const isLocal = midconfig ? midconfig['__path__'] !== undefined : false;
    const pkpath = isLocal ? path.resolve(ctx.cwd,midconfig['__path__']) : 
    path.resolve(ctx.cwd, 'node_modules', `rd-mid-${key}`);
    if (pkpath && fs.existsSync(pkpath)) {
      return require(pkpath);
    }
    const res = await ctx.download(`rd-mid-${key}`);
    if(res) {
      return require(pkpath);
    }
  }
  await mid.initPackage();
  // mid.spainer && (mid.spainer.succeed("中间件加载完成"));
  return mid;
}