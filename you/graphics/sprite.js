import resource from "../utilities/resource.js";
import { Image } from "./image.js";


export class Sprite {

    constructor({
        sheet,
        scale=[1, 1], anchor=[0, 0],
        clip=null
    }={}) {
        this.sheet = sheet;
        this.scale = scale;
        this.anchor = anchor;
        this.clip = clip;
    }

    render(context, x, y) {
        if (!this.sheet) { return }

        context.save();
        context.translate(x, y);
        context.scale(...this.scale);
        if (this.clip) {
            context.translate(-this.anchor[0] * this.clip[2],
                -this.anchor[1] * this.clip[3]);
            this.sheet?.render(context, ...this.clip, 0, 0, ...this.clip.slice(2, 4));
        }
        else {
            context.translate(-this.anchor[0] * this.sheet.width,
                -this.anchor[1] * this.sheet.height);
            this.sheet?.render(context, 0, 0);
        }
        context.restore();
    }

    static async load(url) {
        const data = await resource.json.load(url);

        data.sheet = new Image(data.sheet);

        return new this(data);
    }
}