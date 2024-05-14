import React, {useEffect} from 'react';
import style from './style/index.module.less';
import {fetchRandomImage} from '../../api';

export interface WaterfallProps {
	/**
	 * Is this the principal call to action on the page?
	 */
	primary?: boolean;
	/**
	 * What background color to use
	 */
	backgroundColor?: string;
	/**
	 * How large should the button be?
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Button contents
	 */
	label: string;
	/**
	 * Optional click handler
	 */
	onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Waterfall = ({
	primary = false,
	size = 'medium',
	backgroundColor,
	label,
	...props
}: WaterfallProps) => {
	const [images, setImages] = React.useState<any>([]);
	const mode = primary
		? style['storybook-button--primary']
		: style['storybook-button--secondary'];
	useEffect(() => {
		const getImages = async () => {
			try {
				// 假设fetchRandomImage返回的是图片URL数组
				const imageUrls = await fetchRandomImage(30); // 获取30张图片
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
		<button
			type='button'
			className={[
				style['storybook-button'],
				style[`storybook-button--${size}`],
				mode,
			].join(' ')}
			style={{backgroundColor}}
			{...props}>
			{label}
		</button>
	);
};
