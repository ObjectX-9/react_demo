import React, {useEffect, useRef, useState} from 'react';
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
	childHeight?: number;
	itemStyle?: CSSProperties;
}
// 子项
const ChildItem = (options: ChildItemProps) => {
	const {childHeight = 50, childIndex, itemStyle} = options;
	return (
		<div
			className={style.childContainer}
			style={
				itemStyle ?? {
					position: 'absolute',
					height: childHeight,
					top: childHeight * childIndex,
				}
			}
			key={`${childIndex}${itemStyle?.height}`}>
			{itemStyle ? (
				<span>
					序号{childIndex + 1} 高度：{itemStyle.height} top偏移：
					{itemStyle.top}
				</span>
			) : (
				<span>{childIndex + 1} </span>
			)}
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

// 每一项的数据结构
interface MeasuredDataMap {
	height: number;
	topOffset: number;
}

// 缓存映射的数据结构
interface MeasuredDataList {
	measuredDataMap: MeasuredDataMap[];
	LastMeasuredItemIndex: number;
}

// 不定高
const uncertainHeightRender = (options: VirtualListProps) => {
	const {
		itemHeight = 50,
		itemSumCount = 1000,
		listWidth = 400,
		listHeight = 600,
	} = options;

	// 使用useRef保存itemHeightList，确保在组件生命周期内不变
	const itemHeightListRef = useRef<number[]>(
		new Array(itemSumCount).fill(0).map(() => {
			return itemHeight + Math.round(Math.random() * itemHeight);
		}),
	);

	console.log('✅ ~ itemHeightListRef:', itemHeightListRef.current);

	const getItemHeightByIndex = (index: number) =>
		itemHeightListRef.current[index];

	const measuredData: MeasuredDataList = {
		measuredDataMap: [],
		LastMeasuredItemIndex: -1,
	};

	const estimatedHeight = (defaultItemHeight = 50, itemSumCount: number) => {
		let measuredHeight = 0;
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		if (LastMeasuredItemIndex >= 0) {
			const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
			measuredHeight = lastMeasuredItem.topOffset + lastMeasuredItem.height;
		}
		const unMeasuredItemsCount =
			itemSumCount - measuredData.LastMeasuredItemIndex - 1;
		const totalEstimatedHeight =
			measuredHeight + unMeasuredItemsCount * defaultItemHeight;
		return totalEstimatedHeight;
	};

	const getItemMetaData = (index: number) => {
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		if (index > LastMeasuredItemIndex) {
			let topOffset = 0;
			if (LastMeasuredItemIndex >= 0) {
				const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
				topOffset += lastMeasuredItem.topOffset + lastMeasuredItem.height;
			}
			for (let i = LastMeasuredItemIndex + 1; i <= index; i++) {
				const currentItemSize = getItemHeightByIndex(i);
				measuredDataMap[i] = {height: currentItemSize, topOffset};
				topOffset += currentItemSize;
			}
			measuredData.LastMeasuredItemIndex = index;
		}
		return measuredDataMap[index];
	};

	const getStartIndex = (options: VirtualListProps, scrollOffset: number) => {
		const {itemSumCount = 1000} = options;
		let low = 0;
		let high = itemSumCount - 1;

		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			const currentOffset = getItemMetaData(mid).topOffset;
			if (currentOffset === scrollOffset) {
				return mid;
			} else if (currentOffset < scrollOffset) {
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}
		return low;
	};

	const getEndIndex = (options: VirtualListProps, startIndex: number) => {
		const {listHeight = 600, itemSumCount = 1000} = options;
		const startItem = getItemMetaData(startIndex);
		const maxOffset = startItem.topOffset + listHeight;
		let offset = startItem.topOffset + startItem.height;
		let endIndex = startIndex;

		while (offset <= maxOffset && endIndex < itemSumCount - 1) {
			endIndex++;
			const currentItem = getItemMetaData(endIndex);
			offset += currentItem.height;
		}
		return endIndex;
	};

	const getChildShowRange = (
		options: VirtualListProps,
		scrollOffset: number,
	) => {
		const {itemSumCount = 1000} = options;
		const startIndex = getStartIndex(options, scrollOffset);
		const endIndex = getEndIndex(options, startIndex);
		return {
			bufferStartIndex: Math.max(0, startIndex - 2),
			bufferEndIndex: Math.min(itemSumCount - 1, endIndex + 2),
			startIndex,
			endIndex,
		};
	};

	const getCurShowChild = (options: VirtualListProps, scrollTop: number) => {
		const items = [];
		const {bufferStartIndex, bufferEndIndex} = getChildShowRange(
			options,
			scrollTop,
		);
		for (let i = bufferStartIndex; i <= bufferEndIndex; i++) {
			const item = getItemMetaData(i);
			console.log('✅ ~ item:', item);
			const itemStyle: CSSProperties = {
				position: 'absolute',
				height: item.height,
				width: '100%',
				top: item.topOffset,
			};
			items.push(<ChildItem key={i} childIndex={i} itemStyle={itemStyle} />);
		}
		return items;
	};

	const customContainerStyle: CSSProperties = {
		position: 'relative',
		width: listWidth,
		height: listHeight,
		overflow: 'auto',
		boxSizing: 'border-box',
	};

	const contentStyle: CSSProperties = {
		height: estimatedHeight(itemHeight, itemSumCount),
		width: '100%',
		boxSizing: 'border-box',
	};

	const [scrollTop, setScrollTop] = useState<number>(0);

	useEffect(() => {
		const container = document.querySelector('.fixedHeightContainer');
		if (container) {
			const handleScroll = (event: Event) => {
				const target = event.target as HTMLElement;
				setScrollTop(target.scrollTop);
			};
			container.addEventListener('scroll', handleScroll);
			return () => {
				container.removeEventListener('scroll', handleScroll);
			};
		}
	}, []);

	return (
		<div className='mainContainer'>
			<div className='srcollNum'>已经滚动了：{Math.floor(scrollTop)}</div>
			<div className='fixedHeightContainer' style={customContainerStyle}>
				<div className='customContainer' style={contentStyle}>
					{getCurShowChild(options, scrollTop)}
				</div>
			</div>
		</div>
	);
};

// render函数映射
const getRenderObj: GetRenderFunc = {
	'uncertainHeight': uncertainHeightRender,
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
