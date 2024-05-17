export class WaterFall {
	gap: number; // 间距
	container: HTMLDivElement; // 容器
	heightArr: number[]; // 保存每列的高度信息
	items: HTMLCollection; // 子节点
	renderIndex: number; // 保存已经渲染了的节点
	constructor(container: HTMLDivElement, options: {gap: number}) {
		this.gap = options?.gap ?? 0; // 间距
		this.container = container; // 容器
		this.heightArr = []; // 保存每列的高度信息
		this.items = container.children; // 子节点
		this.renderIndex = 0;
		this.container.addEventListener('resize', () => {
			this.heightArr = [];
			this.layout();
		});
		// 监听节点生成和卸载
		this.container.addEventListener('DOMSubtreeModified', () => {
			this.layout();
		});
	}

	getMaxHeight(heightArr: number[]) {
		let maxHeight = heightArr[0];
		for (let i = 1; i < heightArr.length; i++) {
			if (heightArr[i] > maxHeight) {
				maxHeight = heightArr[i];
			}
		}
		return maxHeight;
	}

	// 计算高度最小的列
	getMinIndex(heightArr: number[]) {
		let minIndex = 0;
		let min = heightArr[minIndex];
		for (let i = 1; i < heightArr.length; i++) {
			if (heightArr[i] < min) {
				min = heightArr[i];
				minIndex = i;
			}
		}
		return minIndex;
	}

	layout() {
		if (this.items.length === 0) return;
		const gap = this.gap;
		const pageWidth = this.container?.offsetWidth || 1000;
		console.log('✅ ~ pageWidth:', pageWidth);
		const itemWidth = (this.items[0] as HTMLDivElement).offsetWidth;
		console.log('✅ ~ itemWidth:', itemWidth);
		const columns = Math.ceil(pageWidth / (itemWidth + gap)) ?? 5; // 总共有多少列
		console.log('✅ ~ columns:', columns);

		while (this.renderIndex < this.items.length) {
			let top, left;
			const curItem = this.items[this.renderIndex] as HTMLDivElement;
			console.log('✅ zhuling ~ ===========>:');
			if (this.renderIndex < columns) {
				// 第一列
				top = 0;
				left = (itemWidth + gap) * this.renderIndex;
				this.heightArr.push(curItem.offsetHeight);
			} else {
				// 找到高度最小的一列
				const minIndex = this.getMinIndex(this.heightArr);
				// 属于那一列，获取第一个元素，要获取left
				const whichColumnFirstItem = this.items[minIndex] as HTMLDivElement;
				// 当前插入的元素
				console.log(
					'✅ zhuling ~  minIndex:',
					minIndex,
					whichColumnFirstItem.offsetHeight + gap,
				);
				console.log('✅ zhuling ~  heightArr213132:', this.heightArr);

				top = this.heightArr[minIndex] + gap;
				left = whichColumnFirstItem.offsetLeft;
				// 重新计算当前插入列的高度
				this.heightArr[minIndex] += curItem.offsetHeight + gap;
			}
			console.log('✅ ~ zhuling top:', top);
			console.log('✅ ~ zhuling left:', left);
			console.log('✅ ~ zhuling===========>:', left, top);

			curItem.style.top = top + 'px';
			curItem.style.left = left + 'px';
			this.renderIndex++;
		}
	}
}
