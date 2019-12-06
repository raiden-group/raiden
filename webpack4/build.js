const webpack = require('webpack');

module.exports = async function (ctx, webpackConfig, opts) {
  const logInfo = ctx.log.info;
  const logError = ctx.log.error;
  logInfo("开始构建...");
  const compiler = webpack(webpackConfig);
  compiler.run(function(err) {
    if (err) {
      logError("构建出错");
      process.exit(4);
    }
    logInfo("构建完成");
  })
}