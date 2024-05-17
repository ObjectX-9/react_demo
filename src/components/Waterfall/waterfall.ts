export class WaterFall {
	gap: number; // 间距
	container: HTMLDivElement; // 容器
	heightArr: number[]; // 保存每列的高度信息
	items: HTMLCollection; // 子节点
	constructor(container: HTMLDivElement, options: {gap: number}) {
		this.gap = options?.gap ?? 0; // 间距
		this.container = container; // 容器
		this.heightArr = []; // 保存每列的高度信息
		this.items = container.children; // 子节点
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
		const pageWidth = this.container.offsetWidth;
		const itemWidth = (this.items[0] as HTMLDivElement).offsetWidth;
		const columns = Math.ceil(pageWidth / (itemWidth + gap)) ?? 5; // 总共有多少列
		for (let i = 0; i < this.items.length; i++) {
			const curItem = this.items[i] as HTMLDivElement;
			let top, left;
			if (i < columns) {
				// 第一列
				top = 0;
				left = (itemWidth + gap) * i;
				this.heightArr.push(curItem.offsetHeight);
			} else {
				const minIndex = this.getMinIndex(this.heightArr);

				console.log(
					'✅ zhuling ~  minIndex:',
					minIndex,
					curItem.offsetHeight + gap,
				);
				console.log('✅ zhuling ~  heightArr213132:', this.heightArr);

				top = this.heightArr[minIndex] + gap;
				left = curItem.offsetLeft;
				// 重新计算当前插入列的高度
				this.heightArr[minIndex] += curItem.offsetHeight + gap;
			}
			curItem.style.top = top + 'px';
			curItem.style.left = left + 'px';
		}
	}
}
