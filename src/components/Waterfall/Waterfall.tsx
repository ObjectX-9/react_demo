import React, {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import style from './style/index.module.less';
import {fetchRandomImage} from '../../api';
import type {UnsplashImage} from '../../api';
import {shuffleArray} from '../../utils';
export interface WaterfallProps {
	waterfallType?: 'column' | 'flex' | 'grid' | 'js';
	/**
	 * 图片数据列表
	 */
	items?: UnsplashImage[];
	/**
	 * 图片列宽度，不传入则按列数，每一列宽度是容器的【1 / maxColumns】
	 */
	columnWidth?: number;
	/**
	 * 图片间距
	 */
	gapSize?: number;
	/**
	 * 最大列数
	 */
	maxColumns?: number;
}

const columnTypeRender = (options: WaterfallProps) => {
	const {items = []} = options;
	return (
		<div className={style.container}>
			{shuffleArray(items)?.map((image: UnsplashImage, index: number) => {
				console.log('✅ zhuling ~  image:', image);

				return (
					<div key={`${image?.id}${index}`} className={style.item}>
						<img src={image.urls.full} alt={`Image ${index}`} />
					</div>
				);
			})}
		</div>
	);
};

const flexTypeRender = (options: WaterfallProps) => {
	const {items = [], maxColumns} = options;
	const [newMaxColumns, setNewMaxColumns] = useState(maxColumns ?? 5);
	useEffect(() => {
		const handleResize = () => {
			console.log(21321321);
			if (window.innerWidth < 600) {
				setNewMaxColumns(2);
			} else if (window.innerWidth < 800) {
				setNewMaxColumns(3);
			} else if (window.innerWidth < 1000) {
				setNewMaxColumns(4);
			} else if (window.innerWidth < 1200) {
				setNewMaxColumns(5);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<div className={style.flexContainer}>
			{Array(newMaxColumns)
				.fill(0)
				?.map((item, index) => {
					return (
						<div className={style.childContainer} key={index}>
							{shuffleArray(items)?.map(
								(image: UnsplashImage, index: number) => {
									console.log('✅ zhuling ~  image:', image);

									return (
										<div key={`${image?.id}${index}`} className={style.item}>
											<img src={image.urls.full} alt={`Image ${index}`} />
										</div>
									);
								},
							)}
						</div>
					);
				})}
		</div>
	);
};

const gridTypeRender = (options: WaterfallProps) => {
	const {items = []} = options;
	const gridContainer = useRef(null);
	useEffect(() => {
		const calcRows = () => {
			const gridContainerNode = gridContainer.current;
			if (gridContainerNode === null) return;
			const items = (gridContainerNode as HTMLDivElement).querySelectorAll(
				'.item',
			);
			// 获取当前列数
			const cols =
				getComputedStyle(gridContainerNode).gridTemplateColumns.split(
					' ',
				).length;
			items.forEach((item, index) => {
				// 给需要上下间隔的元素增加上间隔（每列第一个元素无需上间隔）
				const gapRows = index >= cols ? 8 : 0;
				// 根据元素高度设置元素的需占行数
				const rows = Math.ceil(item.clientHeight / 2) + gapRows;
				(item as HTMLDivElement).style.gridRowEnd = `span ${rows}`;
			});
		};
		// 给每个元素模拟随机高度
		window.addEventListener('load', () => {
			const gridContainerNode = gridContainer.current;
			if (gridContainerNode === null) return;
			const items = (gridContainerNode as HTMLDivElement).querySelectorAll(
				'.item',
			);
			items.forEach((item) => {
				item.style.height = `${Math.floor(Math.random() * 200) + 100}px`;
			});
		});
		window.addEventListener('resize', calcRows);
		window.addEventListener('load', calcRows);
	}, [gridContainer.current]);
	return (
		<div className={style.gridContainer} ref={gridContainer}>
			{shuffleArray(items)?.map((image: UnsplashImage, index: number) => {
				console.log('✅ zhuling ~  image:', image);

				return (
					<div key={`${image?.id}${index}`} className={style.item}>
						<img src={image.urls.full} alt={`Image ${index}`} />
					</div>
				);
			})}
		</div>
	);
};

const jsTypeRender = (options: WaterfallProps) => {
	const {items = []} = options;
	return (
		<div className={style.container}>
			{shuffleArray(items)?.map((image: UnsplashImage, index: number) => {
				console.log('✅ zhuling ~  image:', image);

				return (
					<div key={`${image?.id}${index}`} className={style.item}>
						<img src={image.urls.full} alt={`Image ${index}`} />
					</div>
				);
			})}
		</div>
	);
};

interface GetRenderFunc {
	column: (options: WaterfallProps) => ReactNode;
	flex: (options: WaterfallProps) => ReactNode;
	grid: (options: WaterfallProps) => ReactNode;
	js: (options: WaterfallProps) => ReactNode;
}

// render函数映射
const getRenderObj: GetRenderFunc = {
	'column': columnTypeRender,
	'flex': flexTypeRender,
	'grid': gridTypeRender,
	'js': jsTypeRender,
};

/**
 * 瀑布流组件
 */
export const Waterfall = ({
	waterfallType = 'column',
	items,
	columnWidth = 200,
	gapSize = 10,
	maxColumns = 5,
	...props
}: WaterfallProps) => {
	const [images, setImages] = React.useState<any>([]);

	useEffect(() => {
		const getImages = async () => {
			try {
				const imageUrls = await fetchRandomImage(10); // 获取30张图片
				setImages(imageUrls);
			} catch (error) {
				console.error('Error fetching images from Unsplash:', error);
			}
		};
		getImages();
	}, []);

	useEffect(() => {
		console.log('✅ zhuling ~ images:', images, getRenderObj[waterfallType]);
	}, [images]);

	return getRenderObj[waterfallType]({
		waterfallType,
		items: images,
		columnWidth,
		gapSize,
		maxColumns,
	});
};
