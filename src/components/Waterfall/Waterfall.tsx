import React, {useEffect, useState} from 'react';
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
	// 存储图片高度的状态
	const [heights, setHeights] = useState(Array(items.length).fill(0));

	// 动态计算图片的高度
	const calculateHeights = () => {
		items.forEach((imagesInfo, index) => {
			const img = new Image();
			img.src = imagesInfo.urls.full;
			img.onload = () => {
				const height = img.offsetHeight;
				console.log('✅ ~ height:', height);
				setHeights((prevHeights) => {
					const newHeights = [...prevHeights];
					newHeights[index] = height;
					return newHeights;
				});
			};
		});
	};

	// 组件挂载后计算图片高度
	useEffect(() => {
		calculateHeights();
	}, [items]);

	return (
		<div className={style.gridContainer}>
			{shuffleArray(items)?.map((image: UnsplashImage, index: number) => {
				console.log('✅ zhuling ~ image:', image);

				return (
					<div
						key={`${image?.id}${index}`}
						className={style.item}
						style={{
							gridRowEnd: `span ${Math.ceil(heights[index] / 10) || 1}`, // 计算跨越的行数
						}}>
						<img
							src={image.urls.full}
							alt={`Image ${index}`}
							style={{width: '100%', display: 'block'}}
						/>
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
