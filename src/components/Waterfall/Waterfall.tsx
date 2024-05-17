import React, {useCallback, useEffect, useRef, useState} from 'react';
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
		handleResize();
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
	const gridContainer = useRef<HTMLDivElement>(null);
	const [imagesLoaded, setImagesLoaded] = useState(false);

	// 缓存计算，避免重复计算
	const calcRows = useCallback(() => {
		const gridContainerNode = gridContainer.current;
		if (gridContainerNode === null) return;

		const itemNodes = gridContainerNode.querySelectorAll(`.${style.item}`);
		const cols =
			getComputedStyle(gridContainerNode).gridTemplateColumns.split(' ').length;
		// 计算每个项目占据的位置
		itemNodes.forEach((item, index) => {
			const gapRows = index >= cols ? 8 : 0;
			const rows = Math.ceil((item.clientHeight + gapRows) / 10);
			(item as HTMLDivElement).style.gridRowEnd = `span ${rows}`;
		});
	}, []);

	useEffect(() => {
		// 确保图片加载完成后再去计算布局
		if (imagesLoaded) {
			calcRows();
			const handleResize = () => {
				// 浏览器空闲计算布局
				requestAnimationFrame(calcRows);
			};

			window.addEventListener('resize', handleResize);
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	}, [imagesLoaded, calcRows]);

	// 图片加载完成后再去计算布局，useCallback避免重复计算
	const handleImageLoad = useCallback(() => {
		const totalImages = items.length;
		let loadedImages = 0;

		return () => {
			loadedImages++;
			if (loadedImages === totalImages) {
				setImagesLoaded(true);
			}
		};
	}, [items.length]);

	const onLoad = handleImageLoad();

	return (
		<div className={style.gridContainer} ref={gridContainer}>
			{shuffleArray(items).map((image: UnsplashImage, index: number) => (
				<div key={`${image?.id}${index}`} className={style.item}>
					<img src={image.urls.full} alt={`Image ${index}`} onLoad={onLoad} />
				</div>
			))}
		</div>
	);
};

const jsTypeRender = (options: WaterfallProps) => {
	const {items = []} = options;
	return (
		<div className={style.container}>
			{shuffleArray(items)?.map((image: UnsplashImage, index: number) => {
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

	return getRenderObj[waterfallType]({
		waterfallType,
		items: images,
		columnWidth,
		gapSize,
		maxColumns,
	});
};
