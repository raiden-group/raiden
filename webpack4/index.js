const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
// 插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 处理html
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取css 文件
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin; // 清空webpack输出文件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 打包文件分析

const utils = require('./utils'); // 工具函数
const dev = require('./dev'); 
const build = require('./build');
const cssLoaderHandler = require('./cssUtil');
const defaultFolder = {
  js: 'js',
  css: 'css',
  img: 'img',
  html: '',
  font: 'font',
  chunks: 'chunks'
}
module.exports = async function (ctx, opts) {
  const isDev = opts.env !== 'production' || ctx.command.cmd === 'dev'; // 是否是开发环境
  const isHot = isDev || opts.hot !== false || opts.watch === true; //是否需要热更新
  // 处理配置项
  async function handlerOptions (opts) {
    if (!opts.browsersList) {
      opts.browsersList = opts.isMobile 
        ? ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4']
        : ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9'];
    }
    opts.folders = Object.assign({}, defaultFolder, (opts.folders || {}));
    let webpackConfig = {
      context: ctx.cwd,
      entry: opts.entry,
      mode: opts.env || (isDev ? 'development' : 'production'),
      output: {
        publicPath: opts.publicPath || '/',
        path: path.resolve( ctx.cwd ,(opts.output || './build')),
        filename: `${opts.folders.js}/[name].js`
      },
      module: {
        rules: []
      },
      devtool: opts.devtool === true ? 'source-map': (opts.devtool || false),
      plugins: [],
      optimization: {
        splitChunks: {
          cacheGroups: {
            //打包公共模块
            'common': {
              test(module, chunks) {
                return (module.type !== 'css/mini-extract' &&
                  module.resource &&
                  module.resource.indexOf('node_modules') === -1)
              },
              name: 'common',
              chunks: "all"
            },
            default: false // 取消默认default打包
          }
        }
      }
    }
    if (opts.chunks === true) { 
      webpackConfig.output.chunkFilename = `${opts.folders.chunks}/[name]-[chunkhash].js`;
    }
    return webpackConfig;
  }
  // 处理 babelOptions
  async function babelOptions () {
    const babelConfigPath = path.resolve(ctx.cwd, './babel.config.js');
    let babelOption = {};
    if (fs.existsSync(babelConfigPath)) {
      babelOption = require(babelConfigPath);
    }
    const options = {
      // "babelrc": false,
      ...babelOption,
      presets: [
        [
          require.resolve('babel-preset-env'), {
            useBuiltIns: 'usage'
          }
        ],
        [
          require.resolve('babel-preset-react')
        ],
        require.resolve('babel-preset-stage-0'),
        ...(babelOption.presets || [])
      ],
      plugins: [
        ...(babelOption.plugins || [])
      ]
    };
    if (opts.transform !== false) {
      let transform = opts.transform || {};
      if (isHot) {
        options.plugins.push(require.resolve("react-hot-loader/babel"));
      }
      options.plugins.push([
        require.resolve('babel-plugin-transform-runtime'), {
          'helpers': utils.isNull(transform.helpers) ? true : transform.helpers, // defaults to true
          'polyfill': utils.isNull(transform.polyfill) ? true : transform.polyfill, // defaults to true
          'regenerator': utils.isNull(transform.regenerator) ? true : transform.regenerator, // defaults to true
          'moduleName': transform.moduleName || 'babel-runtime', // defaults to 'babel-runtime'
          'useBuiltIns': transform.useBuiltIns || false
        }
      ]);
    }
    if (opts.chunks === true) {
      options.plugins.push('babel-plugin-syntax-dynamic-import');
    }
    return options;
  }
  // loaders
  async function handlerLoaders (config) {
    let rules = config.module.rules || [];
    const babelOption = await babelOptions();
    const cssLoader = await cssLoaderHandler(ctx, opts);
    rules = rules.concat([
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: babelOption
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      }, 
      {
        test: /\.(png|jpg|gif|jpeg|gif)\?*.*$/,
        loader: `url-loader?limit=8192&name=${opts.folders.img}/[hash].[ext]`
      }, 
      {
        test: /\.(eot|woff|woff2|webfont|ttf|svg)\?*.*$/,
        loader: `url-loader?limit=8192&name=${opts.folders.font}/[hash].[ext]`
      },
      ...cssLoader
    ]);
    config.module.rules = rules;
  }
  // plugins
  async function handlerPlugins (config) {
    const plugins = config.plugins || [];
    // html 模板生成
    const template = utils.isString(opts.template) ? 
      { template: opts.template} : opts.template;
    plugins.push(new HtmlWebpackPlugin(Object.assign({

    }, template)));
    // 清除打包文件
    if (!isDev) {
      plugins.push(new CleanWebpackPlugin());
    }
    // css文件拆分
    const filename = isDev ? '[name].css' : `${opts.folders.css}/[name]-[hash].css`;
    const chunkFilename = isDev ? '[id].css' : `${opts.folders.css}/[id]-[hash].css`;
    plugins.push(new MiniCssExtractPlugin({
      filename,
      chunkFilename
    }));
    if(opts.analyze === true) {
      plugins.push(new BundleAnalyzerPlugin());
    }
    if (isHot) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    config.plugins = plugins;
  }
  async function run() {
    let webpackConfig = await handlerOptions(opts);
    await handlerLoaders(webpackConfig);
    await handlerPlugins(webpackConfig);
    const webpackConfigPath = path.resolve(ctx.cwd, './webpack.config.js');
    if (fs.existsSync(webpackConfigPath)) {
      ctx.log.info("合并自定义配置...");
      const configFn = require(webpackConfigPath);
      if (utils.isFunction(configFn) || utils.isAsync(configFn)) {
        webpackConfig = await configFn(ctx, webpackConfig);
      }
    }
    // 当前执行指令
    const { cmd } = ctx.command;
    if ( cmd === 'dev' ) {
      dev(ctx, webpackConfig, opts);
    } else {
      build(ctx, webpackConfig, opts);
    }
  };
  await run();
}