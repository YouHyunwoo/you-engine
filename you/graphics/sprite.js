import { Image } from "./image.js";


export class Sprite {

    constructor({
        sheet,
        scale=[1, 1], anchor=[0, 0],
        croppingArea=null,
    }={}) {
        if (!sheet) { throw 'required' }

        this.sheet = sheet;
        this.scale = scale;
        this.anchor = anchor;
        this.croppingArea = croppingArea;
    }

    get area() {
        const size = this.croppingArea?.slice(2, 4) ?? this.sheet.size;
        const scaledSize = size.mul(this.scale);
        const scaledPosition = scaledSize.mul(this.anchor).negate;

        return [...scaledPosition, ...scaledSize];
    }

    render(context, x=0, y=0) {
        if (this.sheet.loaded) {
            this._drawSprite(context, x, y);
        }
    }

    _drawSprite(context, x, y) {
        context.save();
        context.translate(x, y);
        context.scale(...this.scale);

        if (this.croppingArea) {
            context.translate(
                -this.anchor[0] * this.croppingArea[2],
                -this.anchor[1] * this.croppingArea[3]
            );
            this.sheet.render(
                context,
                ...this.croppingArea,
                0, 0, this.croppingArea[2], this.croppingArea[3]
            );
        }
        else {
            context.translate(
                -this.anchor[0] * this.sheet.width,
                -this.anchor[1] * this.sheet.height
            );
            this.sheet.render(
                context,
                0, 0
            );
        }

        context.restore();
    }

    toJSON() {
        return {
            sheet: this.sheet.url,
            scale: this.scale,
            anchor: this.anchor,
            croppingArea: this.croppingArea,
        };
    }

    static fromJSON(obj) {
        obj.sheet = new Image(obj.sheet);
        return new this(obj);
    }
}