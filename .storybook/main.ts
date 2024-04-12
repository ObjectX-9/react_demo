import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
	'stories': ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	'addons': [
		'@storybook/addon-onboarding',
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@chromatic-com/storybook',
		'@storybook/addon-interactions',
	],
	'framework': {
		'name': '@storybook/react-vite',
		'options': {},
	},
	'docs': {
		'autodocs': 'tag',
	},
	// //  +++++ 新增 ++++
	// async viteFinal(config) {
	// 	config.base = '/react_demo/';
	// 	return config;
	// },
};
export default config;
