const path =  require('path');

module.exports = async function(ctx, webpackConfig) {
  webpackConfig.resolve  = webpackConfig.resolve || { alias: {} };
  const alias = webpackConfig.resolve.alias;
  webpackConfig.resolve.alias = {
    ...alias,
    img: path.resolve(__dirname, './src/img'),
    components: path.resolve(__dirname, './src/components'),
    utils: path.resolve(__dirname, './src/utils'),
    container: path.resolve(__dirname, './src/container')
  }
  return webpackConfig;
}