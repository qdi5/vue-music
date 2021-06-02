module.exports = {
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
        target: 'http://localhost:8008',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}