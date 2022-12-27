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

    update(deltaTime, events, input) {
		if (this[this.constructor.ENABLE] && this.object?.created) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate');
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate');
		}
	}

    render(context, screen, screens) {
		if (this[this.constructor.ENABLE] && this.object?.created) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender');
			this.didRender(context, screen, screens);
			this.event.emit('didRender');
		}
	}
}