const path = require('path');
const fs = require('fs');

module.exports = async function Middleware (ctx, config) {
  ctx.log.info('初始化中间件');
  var mid = {};
  mid.pakePath = path.resolve(__dirname, '../../'); // 中间件位置
  mid.middlewarelist = []; // 中间件列表
  mid.middlewarelist = Object.keys(config);
  mid.initPackage = async function() {
    const list = mid.middlewarelist;
    const middlewareList = [];
    for (var i = 0; i < list.length; i++) {
      const middleware = list[i];
      ctx.log.debug("get middleware: " + middleware);
      const cb = await mid.getMiddle(middleware);
      ctx.log.debug("run middleware: " + middleware);
      console.log(cb);
      const run = async function () {
        return await cb.call(ctx, ctx, config[middleware]);
      }
      middlewareList.push({ middleware, run, options: config });
    }
    mid.middlewarelist = middlewareList;
  }
  mid.getMiddle = async function(key) {
    const pkpath = path.resolve(this.pakePath, key);
    console.log(pkpath, key);
    if (pkpath && fs.existsSync(pkpath)) return require(pkpath);
    ctx.log.info("install: " + key);
    const res = await ctx.download(key);
    if(res) {
      // return require(pkpath);
    }
    // ctx.log.error("install: " + key + " fail");
    // process.exit(0);

  }
  await mid.initPackage();
  ctx.log.info("中间件加载完成");
  return mid;
}