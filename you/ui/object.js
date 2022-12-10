import { Object } from "../object.js";
import { Scene } from "../scene.js";


export class UIObject extends Object {

    constructor({
        name='', enable=true,
		tags=[],
		components=[],
		objects=[],
		events={},
        position=[0, 0], size=[0, 0],
        clip=true,
    }={}) {
        super({
            name, enable,
            tags,
            components,
            objects,
            events,
        });

        this.position = position;
        this.size = size;
        this.clip = clip;
    }

    get area() { return [...this.position, ...this.size] }
    set area(value) {
        this.position.splice(0, 2, value.slice(0, 2));
        this.size.splice(0, 2, value.slice(2, 4));
    }

    get scene() {
		return this.parent instanceof Scene
				? this.parent
				: this.parent?.scene ?? null
	}

    get globalPosition() {
        return (
			this.parent instanceof Object
			? this.parent.globalPosition.add(this.position)
			: this.position
		);
    }

    update(deltaTime, events, input) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
            if (this.parent instanceof Scene) {
                this.handleUIEvent(events);
            }

			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate', deltaTime, events, input);
			this.components.forEach(component => {
				if (this[this.constructor.STATE] !== this.constructor.STATES.DESTROYED) {
					component.update(deltaTime, events, input);
				}
			});
			this.objects.forEach(object => object.update(deltaTime, events, input));
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate', deltaTime, events, input);
		}
    }

    render(context, screen, screens) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
            context.save();

            context.translate(...this.position.map(Math.floor));

            if (this.clip) {
                context.beginPath();
                context.rect(0, 0, ...this.size.map(Math.floor));
                context.clip();
            }

            this.willRender(context, screen, screens);
			this.event.emit('willRender', context, screen, screens);
			this.components.forEach(component => component.render(context, screen, screens));
			this.objects.forEach(object => object.render(context, screen, screens));
			this.didRender(context, screen, screens);
			this.event.emit('didRender', context, screen, screens);

            context.restore();
		}
	}

    handleUIEvent(events) {
        this.objects.forEach(object => object.handleUIEvent(events));
    }
}