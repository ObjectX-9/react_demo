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
	// 随机高度列表
	const itemHeightList = new Array(itemSumCount).fill(true).map(() => {
		return itemHeight + Math.round(Math.random() * itemHeight);
	});
	// 根据索引获取某一列的高度
	const getItemHeightByIndex = (index: number) => itemHeightList[index];

	// 定义一个数据记录已经展示过的item的高度和索引
	const measuredData: MeasuredDataList = {
		measuredDataMap: [],
		LastMeasuredItemIndex: -1,
	};

	// 预测总高度: 已经知道高度项的总高度+未知高度项的总高度
	const estimatedHeight = (defaultItemHeight = 50, itemSumCount: number) => {
		let measuredHeight = 0;
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		// 计算已经获取过真实高度的项的高度之和
		if (LastMeasuredItemIndex >= 0) {
			const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
			measuredHeight = lastMeasuredItem.topOffset + lastMeasuredItem.height;
		}
		// 未计算过真实高度的项数
		const unMeasuredItemsCount =
			itemSumCount - measuredData.LastMeasuredItemIndex - 1;
		// 预测总高度
		const totalEstimatedHeight =
			measuredHeight + unMeasuredItemsCount * defaultItemHeight;
		return totalEstimatedHeight;
	};

	// 根据规则获取某一项的信息
	const getItemMetaData = (index: number) => {
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		// 如果当前索引比已记录的索引要大，说明要计算当前索引的项的size和offset
		// 简单来说就是，如果当前记录的最大索引比你当前滚动到的索引小，那么说明未被记录，没有插入到容器中
		// 我们可以通过最后一项的topOffset+height去计算下一项，依次计算到当前索引。就能得到当前索引的topOffset和height
		if (index > LastMeasuredItemIndex) {
			let topOffset = 0;
			// 计算当前能计算出来的最大offset值
			if (LastMeasuredItemIndex >= 0) {
				const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
				topOffset += lastMeasuredItem.topOffset + lastMeasuredItem.height;
			}
			// 计算直到index为止，所有未计算过的项
			for (let i = LastMeasuredItemIndex + 1; i <= index; i++) {
				const currentItemSize = getItemHeightByIndex(i);
				measuredDataMap[i] = {height: currentItemSize, topOffset};
				topOffset += currentItemSize;
			}
			// 更新已计算的项的索引值
			measuredData.LastMeasuredItemIndex = index;
		}
		return measuredDataMap[index];
	};

	// 计算起始索引
	const getStartIndex = (options: VirtualListProps, scrollOffset: number) => {
		const {itemSumCount = 1000} = options;
		let index = 0;
		while (true) {
			// 通过记录的数据信息，遍历获取到item的偏移值，直到大于scrollOffset，就是startIndex
			const currentOffset = getItemMetaData(index).topOffset;
			if (currentOffset >= scrollOffset) return index;
			// 如果大于最大长度，起始索引就是itemSumCount
			if (index >= itemSumCount) return itemSumCount;
			index++;
		}
	};

	// 计算终止索引
	const getEndIndex = (options: VirtualListProps, startIndex: number) => {
		const {listHeight = 600, itemSumCount = 1000} = options;
		// 获取可视区内开始的项
		const startItem = getItemMetaData(startIndex);
		// 可视区内最大的offset值
		const maxOffset = startItem.topOffset + listHeight;
		// 开始项的下一项的offset，之后不断累加此offset，直到等于或超过最大offset，就是找到结束索引了
		let offset = startItem.topOffset + startItem.height;
		// 结束索引
		let endIndex = startIndex;
		// 累加offset
		while (offset <= maxOffset && endIndex < itemSumCount - 1) {
			endIndex++;
			const currentItem = getItemMetaData(endIndex);
			offset += currentItem.height;
		}
		return endIndex;
	};

	// 获取可以展示的子集范围
	const getChildShowRange = (
		options: VirtualListProps,
		scrollOffset: number,
	) => {
		const {itemSumCount = 1000} = options;
		// 1.计算起始索引
		const startIndex = getStartIndex(options, scrollOffset);
		// 2.计算终止索引
		const endIndex = getEndIndex(options, startIndex);
		return {
			bufferStartIndex: Math.max(0, startIndex - 2),
			bufferEndIndex: Math.min(itemSumCount - 1, endIndex + 2),
			startIndex,
			endIndex,
		};
	};

	// 1.获取需要展示的子集
	const getCurShowChild = (options: VirtualListProps) => {
		// 获取索引
		const items = [];
		// 2.需要获取要展示的子集在那个范围
		const {bufferStartIndex, bufferEndIndex} = getChildShowRange(
			options,
			scrollTop,
		);
		// 遍历获取样式
		for (let i = bufferStartIndex; i <= bufferEndIndex; i++) {
			// 3.获取每一项的数据，计算出样式
			const item = getItemMetaData(i);
			const itemStyle: CSSProperties = {
				position: 'absolute',
				height: item.height,
				width: '100%',
				top: item.topOffset,
			};
			items.push(
				ChildItem({
					childIndex: i,
					itemStyle,
				}),
			);
		}
		console.log('✅ ~ items:', items);

		return items;
	};

	const customContainerStyle: CSSProperties = {
		position: 'relative',
		width: listWidth,
		height: listHeight,
		overflow: 'auto',
		willChange: 'transform',
	};

	const contentStyle = {
		height: estimatedHeight(itemHeight, itemSumCount),
		width: '100%',
	};

	// 记录滚动掉的高度
	const [scrollTop, setScrollTop] = useState<number>(0);

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
