export class Screen {

    constructor(id, size) {
        this.id = id;
        this._size = size;
    }

    get width() { return this._size[0] }
	set width(value) {
		this._size[0] = value;
	}

	get height() { return this._size[1] }
	set height(value) {
		this._size[1] = value;
	}

	get size() { return this._size }
	set size(value) {
		this._size.splice(0, 2, ...value);
	}
}