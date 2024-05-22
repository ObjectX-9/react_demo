import React, {useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import style from './style/index.module.less';
export interface VirtualListProps {
	/**
	 * 虚拟列表类型
	 */
	virtualListType?:
		| 'uncertainHeight'
		| 'fixedHeight'
		| 'dynamicHeight'
		| 'imgList';
	/**
	 * 列表项高度【定高使用】
	 */
	itemHeight?: number;
	/**
	 * 列表项总数
	 */
	itemSumCount?: number;
	/**
	 * 虚拟列表高度
	 */
	listHeight?: number;
	/**
	 * 虚拟列表宽度
	 */
	listWidth?: number;
}

interface GetRenderFunc {
	uncertainHeight: (options: VirtualListProps) => ReactNode;
	fixedHeight: (options: VirtualListProps) => ReactNode;
	dynamicHeight: (options: VirtualListProps) => ReactNode;
	imgList: (options: VirtualListProps) => ReactNode;
}

interface ChildItemProps {
	childIndex: number;
	childHeight: number;
}
// 子项
const ChildItem = (options: ChildItemProps) => {
	const {childHeight, childIndex} = options;
	return (
		<div
			className={style.childContainer}
			style={{
				position: 'absolute',
				height: childHeight,
				top: childHeight * childIndex,
			}}
			key={childIndex}>
			{childIndex + 1}
		</div>
	);
};

// 定高
const fixedHeightRender = (options: VirtualListProps) => {
	const {itemHeight = 50, itemSumCount = 1000, listWidth, listHeight} = options;
	// 记录滚动掉的高度
	const [scrollTop, setScrollTop] = useState<number>(0);
	// 自定义的列表高度
	const customContainerStyle: CSSProperties = {
		position: 'relative',
		width: listWidth ?? 400,
		height: listHeight ?? 600,
	};
	// 1000个元素撑起盒子的实际高度
	const contentStyle: CSSProperties = {
		height: itemHeight * itemSumCount,
		width: '100%',
	};
	const getCurShowChild = (options: VirtualListProps) => {
		const {itemHeight = 50, itemSumCount = 1000, listHeight = 600} = options;
		// 可视区起始索引
		const startIndex = Math.floor(scrollTop / itemHeight);
		// 上缓冲区起始索引
		const finialStartIndex = Math.max(0, startIndex - 2);
		// 可视区能展示的元素的最大个数
		const numVisible = Math.ceil(listHeight / itemHeight);
		// 下缓冲区结束索引
		const endIndex = Math.min(itemSumCount, startIndex + numVisible + 2);
		const items = [];
		// 根据上面计算的索引值，不断添加元素给container
		for (let i = finialStartIndex; i < endIndex; i++) {
			items.push(
				ChildItem({
					childHeight: itemHeight,
					childIndex: i,
				}),
			);
		}
		return items;
	};
	// 当触发滚动就重新计算
	const scrollHandle = (event: React.UIEvent<HTMLElement>) => {
		const {scrollTop} = event.currentTarget;
		setScrollTop(scrollTop);
	};

	return (
		<div
			className={style.fixedHeightContainer}
			style={customContainerStyle}
			onScroll={scrollHandle}>
			<div className={style.customContainer} style={contentStyle}>
				{getCurShowChild(options)}
			</div>
		</div>
	);
};

// render函数映射
const getRenderObj: GetRenderFunc = {
	'uncertainHeight': () => <></>,
	'fixedHeight': fixedHeightRender,
	'dynamicHeight': () => <></>,
	'imgList': () => <></>,
};

/**
 * 瀑布流组件
 */
export const VirtualList = ({
	virtualListType = 'fixedHeight',
	itemHeight,
	itemSumCount,
	listWidth,
	listHeight,
	...props
}: VirtualListProps) => {
	return getRenderObj[virtualListType]({
		itemHeight,
		itemSumCount,
		listWidth,
		listHeight,
	});
};
