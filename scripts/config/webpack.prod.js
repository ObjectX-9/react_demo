const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const PLUGINS = [new CleanWebpackPlugin()];
module.exports = merge(common, {
	plugins: PLUGINS,
});
