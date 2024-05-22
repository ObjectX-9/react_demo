import type {Meta, StoryObj} from '@storybook/react';
import {VirtualList} from './VirtualList';

const meta = {
	title: '通用/虚拟列表VirtualList',
	component: VirtualList,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof VirtualList>;

export default meta;
type Story = StoryObj<typeof meta>;

// 不定高
export const UncertainHeight: Story = {
	args: {
		virtualListType: 'uncertainHeight',
	},
};

// 定高
export const FixedHeight: Story = {
	args: {
		virtualListType: 'fixedHeight',
		listWidth: 400,
		listHeight: 600,
		itemHeight: 50,
		itemSumCount: 1000,
	},
};

// 动态高度
export const DynamicHeight: Story = {
	args: {
		virtualListType: 'dynamicHeight',
	},
};

// 图片列表
export const ImgList: Story = {
	args: {
		virtualListType: 'imgList',
	},
};
