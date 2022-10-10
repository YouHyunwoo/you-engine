import { Screen as BaseScreen } from "./framework/screen.js";


export class Screen extends BaseScreen {

	constructor(id, size, canvas) {
		super(id, size);

		this.canvas = canvas;
		this.canvas.width = size[0];
		this.canvas.height = size[1];

		this.context = canvas.getContext('2d');
	}

	get width() { return this._size[0] }
	set width(value) {
		this._size[0] = value;
		this.canvas.width = value;
	}

	get height() { return this._size[1] }
	set height(value) {
		this._size[1] = value;
		this.canvas.height = value;
	}

	get size() { return this._size.slice() }
	set size(value) {
		this._size.splice(0, 2, ...value);
		[this.canvas.width, this.canvas.height] = value;
	}

	addEventListener(type, listener) {
		this.canvas.addEventListener(type, listener);
	}

	removeEventListener(type, listener) {
		this.canvas.removeEventListener(type, listener);
	}

	static createOffscreen(id, size) {
		const offscreenCanvas = document.createElement('canvas');

		return new Screen(id, size, offscreenCanvas);
	}
}