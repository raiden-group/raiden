// 支持css less  scss 需自行配置
module.exports = {
  server: {
    server: {
      port: 4000,
      root: './build'
    }
  },
  dev: {
    webpack4: {
      entry: "./src/index.js",
      env: 'development',
      template: "./index.html",
      watch: true,
      cssModules: false, // css 模块化时不支持 通过less 方式的主题替换
      autoOpen: false, 
      modifyVars: {  // 配置less 变量，常用于 库主题替换
        'primary-color': '#1DA57A',
      },
      devtool: true,
      chunks: true,
      folders: {
        css: 'css',
        js: 'js',
        font: 'font'
      },
      isMobile: true,
      port: 8888,
    }
  },
  build: {
    clean: [
      './build'
    ],
    webpack4: {
      entry: "./src/index.js",
      env: 'production',
      output: './build',
      template: './index.html',
      // chunks: false,
      isMobile: true,
      watch: false,
      analyze: false,  // 启动打包文件分析
      transform: false,
      folders: {
        css: 'css',
        js: 'js',
        font: 'font'
      },
      common: true,
      modifyVars: {  // 配置less 变量，常用于 库主题替换
        'primary-color': '#1DA57A',
      },
    }
  }
}