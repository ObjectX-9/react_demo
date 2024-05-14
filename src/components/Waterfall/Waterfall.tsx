import React, {useEffect} from 'react';
import style from './style/index.module.less';
import {fetchRandomImage} from '../../api';
import type {UnsplashImage} from '../../api';
export interface WaterfallProps {
	// 要显示的项目
	items?: string[];
	// 图片列宽度
	columnWidth?: number;
	// 图片间距
	gapSize?: number;
	// 最大列数
	maxColumns?: number;
}

/**
 * 瀑布流组件
 */
export const Waterfall = ({
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
		console.log('✅ zhuling ~ images:', images);
	}, [images]);
	return (
		<div className={style.container}>
			{images?.map((image: UnsplashImage, index: number) => {
				console.log('✅ zhuling ~  image:', image);

				return (
					<div key={image?.id} className={style.item}>
						<img src={image.urls.full} alt={`Image ${index}`} />
					</div>
				);
			})}
		</div>
	);
};
