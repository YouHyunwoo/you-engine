import { Enable as EnableObject } from "./framework/object.js";


export class Component extends EnableObject {

    constructor({
        enable=true,
		events={},
    }={}) {
        super({
            enable,
			events,
		});

        this.object = null;
    }
}