import type {Meta, StoryObj} from '@storybook/react';
import {Waterfall} from './Waterfall';

const meta = {
	title: '通用/Waterfall瀑布流',
	component: Waterfall,
	parameters: {
		// layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof Waterfall>;

export default meta;
type Story = StoryObj<typeof meta>;

// 使用column方案实现的瀑布流
export const ColumnWaterfall: Story = {
	args: {
		waterfallType: 'column',
	},
};

// 使用flex方案实现瀑布流
export const FlexWaterfall: Story = {
	args: {
		waterfallType: 'flex',
	},
};

// 使用grid方案实现瀑布流
export const GridWaterfall: Story = {
	args: {
		waterfallType: 'grid',
	},
};

// js封装方案实现瀑布流
export const JsWaterfall: Story = {
	args: {
		waterfallType: 'js',
	},
};
