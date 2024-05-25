import React, {useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import style from './style/index.module.less';
export interface VirtualListProps {
	/**
	 * 虚拟列表类型
	 */
	virtualListType?: 'uncertainHeight' | 'fixedHeight' | 'dynamicHeight';
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
	/**
	 * 缓冲区大小
	 */
	bufferNum?: number;
}

interface GetRenderFunc {
	uncertainHeight: (options: VirtualListProps) => ReactNode;
	fixedHeight: (options: VirtualListProps) => ReactNode;
	dynamicHeight: (options: VirtualListProps) => ReactNode;
}

interface ChildItemProps {
	childIndex: number;
	childHeight?: number;
	itemStyle?: CSSProperties;
}

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

interface DynamicChildItemProps {
	key: string;
	onSizeChange: (index: number, domNode: HTMLDivElement) => void;
	getChildItem: (index: number) => ReactNode;
	childIndex: number;
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
		const finialEndIndex = Math.min(itemSumCount, startIndex + numVisible + 2);
		const items = [];
		// 根据上面计算的索引值，不断添加元素给container
		for (let i = finialStartIndex; i < finialEndIndex; i++) {
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
			<div className={style.contentContainer} style={contentStyle}>
				{getCurShowChild(options)}
			</div>
		</div>
	);
};

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
	const getItemHeightByIndex = (index: number) =>
		itemHeightListRef.current[index];

	const measuredData: MeasuredDataList = {
		measuredDataMap: [],
		LastMeasuredItemIndex: -1,
	};

	// 预测高度：已经记录的总高度【已经展示过的项相加】+未记录的总高度【未展示过的项*默认高度计算】
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

	// LastMeasuredItemIndex是已经被记录的滚动到的最大索引，如果是大于LastMeasuredItemIndex，
	// 则可以通过一项一项的相加，加到index就是当前项的最大偏移值
	const getItemMetaData = (index: number) => {
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		if (index > LastMeasuredItemIndex) {
			let topOffset = 0;
			// 先获取到最底部新增的一项的topOffset
			if (LastMeasuredItemIndex >= 0) {
				const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
				topOffset += lastMeasuredItem.topOffset + lastMeasuredItem.height;
			}
			// 遍历记录，直到index
			for (let i = LastMeasuredItemIndex + 1; i <= index; i++) {
				const currentItemSize = getItemHeightByIndex(i);
				measuredDataMap[i] = {height: currentItemSize, topOffset};
				topOffset += currentItemSize;
			}
			measuredData.LastMeasuredItemIndex = index;
		}
		return measuredDataMap[index];
	};

	// 查找起始索引，从记录的数据结构中查找，第一项就是topOffset >= srcollTop
	// 用二分法进行优化
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

	// 查找终止索引：通过起始item的topOffset+自定义的listHeight可以计算出当前能显示的最大偏移值maxOffset
	// 从startItem一直遍历加上height，直到offset >= maxOffset
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

	// 获取当前可现实的范围
	const getChildShowRange = (
		options: VirtualListProps,
		scrollOffset: number,
	) => {
		const {itemSumCount = 1000, bufferNum = 4} = options;
		const startIndex = getStartIndex(options, scrollOffset);
		const endIndex = getEndIndex(options, startIndex);
		return {
			bufferStartIndex: Math.max(0, startIndex - bufferNum),
			bufferEndIndex: Math.min(itemSumCount - 1, endIndex + bufferNum),
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
			const itemStyle: CSSProperties = {
				position: 'absolute',
				height: item.height,
				width: '100%',
				top: item.topOffset,
			};
			items.push(<ChildItem key={i} childIndex={i} itemStyle={itemStyle} />);
		}
		console.log('✅ ~ measuredData:', measuredData);

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
		const container = document.querySelector('.uncertainHeightContainer');
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
			<div className='uncertainHeightContainer' style={customContainerStyle}>
				<div className='contentContainer' style={contentStyle}>
					{getCurShowChild(options, scrollTop)}
				</div>
			</div>
		</div>
	);
};

// 获取任意高度的item
const getRandomHeightItem = (() => {
	let items: ReactNode[] | null = null;
	return () => {
		if (items) return items;
		items = [];
		const itemCount = 1000;
		for (let i = 0; i < itemCount; i++) {
			const height = 30 + Math.floor(Math.random() * 30);
			const style = {
				height,
				width: '100%',
			};
			items.push(<ChildItem key={i} childIndex={i} itemStyle={style} />);
		}
		return items;
	};
})();

// 动态获取子集
const DynamicChildItem = (options: DynamicChildItemProps) => {
	const {itemStyle, getChildItem, onSizeChange, childIndex} = options;
	const childRef = useRef(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const domNode = childRef.current;
		if (domNode) {
			if (!resizeObserverRef.current) {
				resizeObserverRef.current = new ResizeObserver(() => {
					onSizeChange(childIndex, domNode);
				});
			}
			resizeObserverRef.current.observe(domNode);
		}
		return () => {
			if (resizeObserverRef.current && domNode) {
				resizeObserverRef.current.unobserve(domNode);
			}
		};
	}, [childIndex, onSizeChange]);

	return (
		<div ref={childRef} style={itemStyle}>
			{getChildItem(childIndex)}
		</div>
	);
};

const getOneChildItem = (index: number) => getRandomHeightItem()[index];

const measuredData: MeasuredDataList = {
	measuredDataMap: [],
	LastMeasuredItemIndex: -1,
};
// 动态高度
const dynamicHeightRender = ({
	itemSumCount = 1000,
	listWidth = 400,
	listHeight = 600,
	itemHeight = 50,
}) => {
	// 监听节点尺寸变化，更新measuredDataMap，触发重新渲染
	const sizeChangeHandle = (index: number, domNode: HTMLDivElement) => {
		const height = (domNode.children[0] as HTMLDivElement).offsetHeight;
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		measuredDataMap[index].height = height;
		let offset = 0;
		// 重新计算偏移值
		for (let i = 0; i <= LastMeasuredItemIndex; i++) {
			measuredDataMap[i].topOffset = offset;
			offset += measuredDataMap[i].height;
		}
		domNode.style.height = height + 'px';
		// 触发列表的一次更新
		setNeedUpdate(true);
	};

	// 预测高度
	const estimatedHeight = (defaultItemHeight: number, itemSumCount: number) => {
		let measuredHeight = 0;
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		// 计算已经记录的高度，最后一项的top+height
		if (LastMeasuredItemIndex >= 0) {
			measuredHeight =
				measuredDataMap[LastMeasuredItemIndex].topOffset +
				measuredDataMap[LastMeasuredItemIndex].height;
		}
		// [已记录的高度] + [预测高度 * 剩余项]
		return (
			measuredHeight +
			(itemSumCount - LastMeasuredItemIndex - 1) * defaultItemHeight
		);
	};

	// 获取每一项的元数据
	const getItemMetaData = (index: number) => {
		const {measuredDataMap, LastMeasuredItemIndex} = measuredData;
		// 如果index大于当前记录的最大值，挨个计算到index去，用top+height一个一个计算
		if (index > LastMeasuredItemIndex) {
			let topOffset =
				LastMeasuredItemIndex >= 0
					? measuredDataMap[LastMeasuredItemIndex].topOffset +
						measuredDataMap[LastMeasuredItemIndex].height
					: 0;
			for (let i = LastMeasuredItemIndex + 1; i <= index; i++) {
				measuredDataMap[i] = {height: 50, topOffset};
				topOffset += 50;
			}
			measuredData.LastMeasuredItemIndex = index;
		}
		return measuredDataMap[index];
	};

	// 通过scrollTop滚动过的高度，topOffset >= scrollTop的就是当前展示的起始索引
	// 用二分法优化
	const getStartIndex = (scrollOffset: number) => {
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

	// 根据startIndex和 当前设置的listHeight，计算出最大偏移值maxOffset，获取item直到topOffset大于maxOffset
	const getEndIndex = (startIndex: number) => {
		const startItem = getItemMetaData(startIndex);
		const maxOffset = startItem.topOffset + listHeight;
		let offset = startItem.topOffset + startItem.height;
		let endIndex = startIndex;
		while (offset <= maxOffset && endIndex < itemSumCount - 1) {
			endIndex++;
			offset += getItemMetaData(endIndex).height;
		}
		return endIndex;
	};

	// 获取渲染范围，加上缓冲区
	const getChildShowRange = (scrollOffset: number) => {
		const bufferNum = 4;
		const startIndex = getStartIndex(scrollOffset);
		const endIndex = getEndIndex(startIndex);
		return {
			bufferStartIndex: Math.max(0, startIndex - bufferNum),
			bufferEndIndex: Math.min(itemSumCount - 1, endIndex + bufferNum),
			startIndex,
			endIndex,
		};
	};

	// 根据当前显示范围，插入节点，节点通过getOneChildItem动态获取
	const getCurShowChild = (scrollTop: number) => {
		const items = [];
		const {bufferStartIndex, bufferEndIndex} = getChildShowRange(scrollTop);
		for (let i = bufferStartIndex; i <= bufferEndIndex; i++) {
			const item = getItemMetaData(i);
			const itemStyle: CSSProperties = {
				position: 'absolute',
				height: item.height,
				width: '100%',
				top: item.topOffset,
			};
			items.push(
				<DynamicChildItem
					key={`${i}${item.topOffset}`}
					childIndex={i}
					getChildItem={getOneChildItem}
					onSizeChange={sizeChangeHandle}
					itemStyle={itemStyle}
				/>,
			);
		}
		return items;
	};

	const containerRef = useRef(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [needUpdate, setNeedUpdate] = useState(false);
	console.log('✅ ~ needUpdate:', needUpdate);

	useEffect(() => {
		if (!containerRef.current) return;
		const container = containerRef.current as HTMLDivElement;
		if (container) {
			const handleScroll: EventListener = (evt) => {
				const event = evt as UIEvent;
				setScrollTop((event.target as HTMLElement).scrollTop);
			};
			container.addEventListener('scroll', handleScroll);
			return () => {
				container.removeEventListener('scroll', handleScroll);
			};
		}
	}, []);

	return (
		<div className='mainContainer'>
			<div className='scrollNum'>已经滚动了：{Math.floor(scrollTop)}</div>
			<div
				className='dynamicHeightContainer'
				ref={containerRef}
				style={{
					position: 'relative',
					width: listWidth,
					height: listHeight,
					overflow: 'auto',
					boxSizing: 'border-box',
				}}>
				<div
					className='contentContainer'
					style={{
						height: estimatedHeight(itemHeight, itemSumCount),
						width: '100%',
						boxSizing: 'border-box',
					}}>
					{getCurShowChild(scrollTop)}
				</div>
			</div>
		</div>
	);
};

// render函数映射
const getRenderObj: GetRenderFunc = {
	'uncertainHeight': uncertainHeightRender,
	'fixedHeight': fixedHeightRender,
	'dynamicHeight': dynamicHeightRender,
};

/**
 * 虚拟列表组件
 */
export const VirtualList = ({
	virtualListType = 'fixedHeight',
	itemHeight,
	itemSumCount,
	listWidth,
	listHeight,
	bufferNum,
	...props
}: VirtualListProps) => {
	return getRenderObj[virtualListType]({
		itemHeight,
		itemSumCount,
		listWidth,
		listHeight,
	});
};
