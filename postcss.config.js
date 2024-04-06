const {isDev} = require('./scripts/constants');
module.exports = {
	ident: 'postcss',
	plugins: [
		// 修复一些和 flex 布局相关的 bug
		require('postcss-flexbugs-fixes'),
		require('postcss-preset-env')({
			autoprefixer: {
				grid: true,
				flexbox: 'no-2009',
			},
			stage: 3,
		}),
		require('postcss-normalize'),
	],
	sourceMap: isDev,
};
