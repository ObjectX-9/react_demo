import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

// 获取你的 HTML 文件中的根 DOM 元素
const container = document.getElementById('root');

// 非空断言，确保 container 不是 null
if (container !== null) {
	const root = ReactDOM.createRoot(container);
	root.render(<App />);
} else {
	console.error('Failed to find the root element');
}
