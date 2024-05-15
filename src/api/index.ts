import axios from 'axios';
import {IMG_DATA} from './imgData';
export const UNSPLASH_ACCESS_KEY =
	'-hYErx6z6tZevGWFjgXRtZQGURheNVLWeNdcU_jx0w8';
export interface UnsplashImage {
	id: string;
	created_at: string;
	updated_at: string;
	width: number;
	height: number;
	color: string;
	blur_hash: string;
	description: string | null;
	alt_description: string;
	urls: {
		raw: string;
		full: string;
		regular: string;
		small: string;
		thumb: string;
		small_s3: string;
	};
	links: {
		self: string;
		html: string;
		download: string;
		download_location: string;
	};
	topic_submissions: {
		experimental: {
			'status': string;
		};
		wallpapers: {
			'status': string;
		};
		'3d-renders': {
			'status': string;
			'approved_on': string;
		};
	};
	slug: string;
	breadcrumbs: string[];
	current_user_collections: string[];
	promoted_at: string;
	sponsorship: string | null;
	alternative_slugs: {
		en: string;
		es: string;
		ja: string;
		fr: string;
		it: string;
		ko: string;
		de: string;
		pt: string;
	};
	likes: number;
	liked_by_user: boolean;
	user: {
		id: string;
		username: string;
		name: string;
		first_name: string;
		last_name: string;
		portfolio_url: string | null;
		bio: string | null;
		location: string | null;
		total_likes: number;
		total_photos: number;
		total_collections: number;
		profile_image: {
			small: string;
			medium: string;
			large: string;
		};
		instagram_username: string | null;
		twitter_username: string | null;
		updated_at: string;
		total_promoted_photos: number;
		total_illustrations: number;
		for_hire: boolean;
		accepted_tos: boolean;
		total_promoted_illustrations: number;
		links: {
			self: string;
			html: string;
			photos: string;
			likes: string;
			portfolio: string;
			following: string;
			followers: string;
		};
		social: {
			instagram_username: string | null;
			portfolio_url: string | null;
			twitter_username: string | null;
			paypal_email: string | null;
		};
	};
}
interface I_ImgRes {
	config: any;
	data: UnsplashImage[];
	status: number;
	statusText: string;
}
/**
 * 请求任意200张图片
 * @returns
 */
export const fetchRandomImage = async (imgNums: number) => {
	return IMG_DATA;
	// eslint-disable-next-line no-unreachable
	try {
		const res: I_ImgRes = await axios.get(
			'https://api.unsplash.com/photos/random',
			{
				params: {
					client_id: UNSPLASH_ACCESS_KEY, // 替换为你的Access Key
					count: imgNums,
				},
			},
		);
		return res.data.length !== 0 ? res?.data : [];
	} catch (error) {
		console.error('Error fetching image from Unsplash:', error);
	}
};
