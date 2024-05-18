import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import style from './style/index.module.less';
import {fetchRandomImage} from '../../api';
import type {UnsplashImage} from '../../api';
import {shuffleArray} from '../../utils';
import {WaterFall} from './waterfallClass';
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
				console.log('✅  ~  image:', image);

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
	useEffect(() => {
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
	let loading = false;
	const {items = []} = options;
	const jsContainer = useRef<HTMLDivElement>(null);

	// 获取1-400之间的任意高度
	const getRandomHeight = (min = 1, max = 4) => {
		return (Math.floor(Math.random() * (max - min + 1)) + min) * 100;
	};

	// 生成随机的柔和颜色
	const getRandomColor = () => {
		const hue = Math.floor(Math.random() * 360); // 0到360度
		const saturation = Math.floor(Math.random() * 20) + 70; // 70%到90%的饱和度
		const lightness = Math.floor(Math.random() * 20) + 70; // 70%到90%的亮度
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	// 模拟异步请求数据
	async function getData(num = 5) {
		console.log('✅ ~ 请求数据num:', num);
		const jsContainerNode = jsContainer.current;
		if (jsContainerNode === null) return;
		const images = (await fetchRandomImage(num)) as UnsplashImage[];
		for (let i = 0; i < images.length; i++) {
			const div = document.createElement('div');
			div.className = `${style.jsItem}`;
			const img = new Image();
			img.src = images[i].urls.full;
			// 等待图片加载完成，将图片依次插入到容器中
			img.onload = () => {
				const fragment = document.createDocumentFragment();
				div.className = `${style.jsItem}`;
				div.style.height = getRandomHeight(4, 1) + 'px';
				div.style.backgroundColor = getRandomColor(); // 设置随机颜色
				div.style.backgroundColor = getRandomColor(); // 设置随机颜色
				div.appendChild(img);
				fragment.appendChild(div);
				jsContainerNode.appendChild(fragment);
			};
			img.onerror = () => {
				console.error('Image failed to load');
			};
		}
	}

	// 触底增加数据
	const handScorllAddData = async () => {
		const scrollTop = document.documentElement.scrollTop;
		const clientHeight = document.documentElement.clientHeight;
		const scrollHeight = document.body.scrollHeight;
		const buffer = 50; // 缓冲区距离
		console.log(
			`Scroll Top: ${scrollTop}, Client Height: ${clientHeight}, Scroll Height: ${scrollHeight}`,
		);

		if (scrollTop + clientHeight >= scrollHeight - buffer && !loading) {
			loading = true;
			console.log('触底，开始加载数据...');
			await getData(5);
			loading = false;
			console.log('数据加载完成');
		}
	};

	// 先获取20条数据
	useEffect(() => {
		getData(20);
	}, []);

	// 渲染绘制
	useEffect(() => {
		const jsContainerNode = jsContainer.current;
		if (jsContainerNode === null) return;
		const water = new WaterFall(jsContainerNode, {gap: 10});
		water.layout();
	}, [items]);

	// 触底增加
	useEffect(() => {
		const onScroll = () => {
			console.log('滚动事件触发');
			handScorllAddData();
		};

		window.addEventListener('scroll', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}, []);

	return <div className={style.jsContainer} ref={jsContainer}></div>;
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
