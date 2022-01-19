export class Text {

    constructor(text, position, size, color) {
        this.text = text ?? '';
        this.position = position ?? [0, 0];
        this.size = size ?? [0, 0];
        this.color = color ?? 'black';
        this.fontSize = '12px';
        this.fontFamily = 'Arial';
        this.backgroundColor = null;
        this.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
    }

    render(context) {
        context.save();

        if (this.backgroundColor) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(...this.position, ...this.size);
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
        const tph = { left: 0, center: this.size[0] / 2, right: this.size[0] };
        const tpv = { top: 0, middle: this.size[1] / 2, bottom: this.size[1] };

        const tp = [
            this.position[0] + tph[this.alignment.horizontal],
            this.position[1] + tpv[this.alignment.vertical],
        ];

        return tp;
    }
}