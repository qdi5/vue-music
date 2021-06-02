const vConsolePlugin = require('vconsole-webpack-plugin');
module.exports = {
  configureWebpack: config => {
    const pluginsDev = []
    if (['development'].includes(process.env.NODE_ENV)) {
			pluginsDev.push(
				// 移动端模拟开发者工具(https://github.com/diamont1001/vconsole-webpack-plugin  https://github.com/Tencent/vConsole)
				new vConsolePlugin({
					filter: [], // 需要过滤的入口文件
					enable: true // 发布代码前记得改回 false
				})
			)
		}
    config.plugins = [...config.plugins, ...pluginsDev]
  },
  devServer: {
    // 允许通过ip访问
    host: '0.0.0.0',
    // 不检查主机名
    disableHostCheck: true,
    port: 3007,
    // 配置自动启动浏览器
    open: true,
    // 热更新
    hotOnly: true,
    proxy: {
      '/api': {
        // 接口跨域，需要配置这个参数
        target: 'http://192.168.31.76:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}