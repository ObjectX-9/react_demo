import axios from 'axios';
export const UNSPLASH_ACCESS_KEY =
	'-hYErx6z6tZevGWFjgXRtZQGURheNVLWeNdcU_jx0w8';
/**
 * 请求任意200张图片
 * @returns
 */
export const fetchRandomImage = async (imgNums: number) => {
	try {
		return await axios.get('https://api.unsplash.com/photos/random', {
			params: {
				client_id: UNSPLASH_ACCESS_KEY, // 替换为你的Access Key
				count: imgNums,
			},
		});
	} catch (error) {
		console.error('Error fetching image from Unsplash:', error);
	}
};
