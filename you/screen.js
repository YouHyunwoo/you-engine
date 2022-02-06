export class Screen {

	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.canvas.width = width;
		this.canvas.height = height;

		this.context = canvas.getContext('2d');
	}

	get width() { return this.canvas.width }
	set width(value) { this.canvas.width = value }

	get height() { return this.canvas.height }
	set height(value) { this.canvas.height = value }

	get size() { return [this.canvas.width, this.canvas.height] }
	set size(value) { [this.canvas.width, this.canvas.height] = value }

	addEventListener(type, listener) {
		this.canvas.addEventListener(type, listener);
	}

	removeEventListener(type, listener) {
		this.canvas.removeEventListener(type, listener);
	}

	static createOffscreen(width, height) {
		const offscreenCanvas = document.createElement('canvas');

		return new Screen(offscreenCanvas, width, height);
	}
}