import type {Meta, StoryObj} from '@storybook/react';
import {Waterfall} from './Waterfall';

const meta = {
	title: '通用/Waterfall瀑布流',
	component: Waterfall,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof Waterfall>;

export default meta;
type Story = StoryObj<typeof meta>;

// 使用column方案实现的瀑布流
export const CloumnWaterfall: Story = {
	args: {},
};
