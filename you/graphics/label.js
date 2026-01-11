export class Label {

    constructor({
        text='',
        position=[0, 0], size=[0, 0],
        color='black', fontSize='12px', fontFamily='Arial',
        backgroundColor=null,
        alignment={ horizontal: 'center', vertical: 'middle' },
    }={}) {
        this.text = text;
        this._position = position;
        this._size = size;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.backgroundColor = backgroundColor;
        this.alignment = alignment;
    }

    get position() { return this._position }
    set position(value) { this._position.splice(0, 2, ...value) }
    get size() { return this._size }
    set size(value) { this._size.splice(0, 2, ...value) }
    get area() { return [...this._position, ...this._size] }
    set area(value) {
        this._position.splice(0, 2, value.slice(0, 2));
        this._size.splice(0, 2, value.slice(2, 4));
    }
    get font() { return `${this.fontSize} ${this.fontFamily}` }
    set font(value) {
        [this.fontSize, this.fontFamily] = value.split(' ');
    }

    render(context) {
        context.save();

        if (this.backgroundColor) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(...this._position, ...this._size);
        }

        const textPosition = this.getTextPosition();

        context.textAlign = this.alignment.horizontal;
        context.textBaseline = this.alignment.vertical;
        context.font = `${this.fontSize} ${this.fontFamily}`;
        context.fillStyle = this.color;
        context.fillText(this.text, ...textPosition);

        context.restore();
    }

    getTextPosition() {
        const tph = { left: 0, center: this._size[0] / 2, right: this._size[0] };
        const tpv = { top: 0, middle: this._size[1] / 2, bottom: this._size[1] };

        const tp = [
            this._position[0] + tph[this.alignment.horizontal],
            this._position[1] + tpv[this.alignment.vertical],
        ];

        return tp;
    }
}