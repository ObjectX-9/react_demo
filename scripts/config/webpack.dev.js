const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const {SERVER_HOST, SERVER_PORT} = require('../constants');
module.exports = merge(common, {
	stats: 'errors-only', // 终端仅打印 error
	devtool: 'eval-source-map',
	devServer: {
		host: SERVER_HOST, // 指定 host，不设置的话默认是 localhost
		port: SERVER_PORT, // 指定端口，默认是8080
		client: {
			// 控制日志输出格式
			logging: 'info', // 选择 'none', 'error', 'warn', 'info', 'log', 或 'verbose'
		},
		compress: true, // 是否启用 gzip 压缩
		open: true, // 打开默认浏览器
		hot: true, // 热更新
	},
});
