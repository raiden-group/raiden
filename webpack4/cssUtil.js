const autoprefixer =  require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = async function cssLoaderHandler(ctx, opts) {
  const isDev = opts.env !== 'production'; // 是否是开发环境
  const isMobile = !!opts.isMobile;
  const miniLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDev,
      reloadAll: true,
    },
  }
  
  const createCssLoader = (hasModules) => {
    return {
      loader: 'css-loader',
      options: {
        sourceMap: opts.sourceMap !== false,
        modules: (opts.cssModules === true && hasModules),
        ...(opts.cssLoaderOptions || {})
      }
    }
  }
  const lessLoader = {
    loader: 'less-loader',
    options: {
      javascriptEnabled: true,
      modifyVars: opts.modifyVars||{}
    }
  }
  // 移动端支持 px2vw 方案
  // 默认配置
  const defaultPxToViewportOptions = { 
    viewportWidth: 750, // (Number) The width of the viewport. 
    viewportHeight: 1334, // (Number) The height of the viewport. 
    unitPrecision: 5, // (Number) The decimal numbers to allow the REM units to grow to. 
    viewportUnit: 'vw', // (String) Expected units. 
    selectorBlackList: ['.ignore', '.hairlines'], // (Array) The selectors to ignore and leave as px. 
    minPixelValue: 1, // (Number) Set the minimum pixel value to replace. 
    mediaQuery: false // (Boolean) Allow px to be converted in media queries. 
  };
  // 移动端专用
  const postCssmobileOptions = [
    require('postcss-px-to-viewport')(
     Object.assign(defaultPxToViewportOptions, (opts.pxToViewportOptions || {}))
    ),
    // 长宽比
    require('postcss-aspect-ratio-mini'),
    // 1px border
    require('postcss-write-svg')({
      utf8: false
    })
  ]
  // postLoader
  const postLoader = {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        autoprefixer({
          browsers: opts.browserslist,
          flexbox: 'no-2009',
        }),
        ...(isMobile ? postCssmobileOptions : []),
        ...(isDev || opts.compress === false
          ? []
          : [
            require('cssnano')({
              preset: [
                'default',
                opts.cssnano || {
                  mergeRules: false,
                  normalizeUrl: false,
                  autoprefixer: false,
                  'postcss-zindex': false,
                },
              ],
            }),
          ]),
      ]
    }
  }
  const icssLoader = createCssLoader(true); 
  const ocssLoader = createCssLoader(false); // 没有 modules 功能
  const commonLoader = [ miniLoader , icssLoader, postLoader ];
  if ( isDev ) {
    commonLoader.unshift('css-hot-loader');
  }
  return [
    {
      test: /\.css$/,
      include: /(node_modules)/,
      use: [
        miniLoader,
        ocssLoader,
        postLoader
      ]
    },
    {
      test: /\.css$/,
      exclude: /(node_modules)/,
      use: [
        ...commonLoader
      ]
    },
    {
      test: /\.less$/,
      exclude: /(node_modules)/,
      use: [
        ...commonLoader,
        lessLoader
      ]
    },
    {
      test: /\.less$/,
      include: /(node_modules)/,
      use: [
        miniLoader,
        ocssLoader,
        postLoader,
        lessLoader
      ]
    }
  ]
}