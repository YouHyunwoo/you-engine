import { Object } from "../object.js";
import { Scene } from "../scene.js";


export class View extends Object {

    constructor({
        name='', enable=true,
		tags=[],
		components=[],
		objects=[],
		events={},
        eventHandling=true,
        position=[0, 0], size,
        clip=true,
        backgroundColor=null,
        borderColor=null, borderWidth=1,
    }={}) {
        super({
            name, enable,
            tags,
            components,
            objects,
            events,
        });

        this.eventHandling = eventHandling;
        this.position = position;
        this.size = size;
        this.clip = clip;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;

        this._mouseDown = false;
        this._mouseIn = false;
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
			this.parent instanceof View
			? this.parent.globalPosition.add(this.position)
			: this.position
		);
    }

    create(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.INSTANTIATED) {
            if (this.position instanceof Function) {
                this.position = this.position.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
            }
            if ((this.size ?? null) === null) {
                this.size = [null, null];
            }
            else if (this.size instanceof Function) {
                this.size = this.size.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
            }

            if (this.size[0] === null) {
                this.size[0] = this.parent instanceof Scene ? this.scene.application.screen.size[0] : this.parent.size[0];
            }
            if (this.size[1] === null) {
                this.size[1] = this.parent instanceof Scene ? this.scene.application.screen.size[1] : this.parent.size[1];
            }

			this.willCreate(...args);
			this.event.emit('willCreate', ...args);
			this[this.constructor.STATE] = this.constructor.STATES.CREATED;
			this.components.forEach(component => component.create(...args));
			this.objects.forEach(object => object.create(...args));
			this.didCreate(...args);
			this.event.emit('didCreate', ...args);
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

            if (this.backgroundColor) {
                context.save();
                context.fillStyle = this.backgroundColor;
                context.fillRect(0, 0, ...this.size.map(Math.floor));
                context.restore();
            }

            this.willRender(context, screen, screens);
			this.event.emit('willRender', context, screen, screens);
			this.components.forEach(component => component.render(context, screen, screens));
			this.objects.forEach(object => object.render(context, screen, screens));
			this.didRender(context, screen, screens);
			this.event.emit('didRender', context, screen, screens);

            if (this.borderColor) {
                context.save();
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(0, 0, ...this.size.map(Math.floor));
                context.restore();
            }

            context.restore();
		}
	}

    handleUIEvent(events) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
            if (!this.size) { return }

            let area = [...this.globalPosition, ...this.size];

            const propagationEvents = new Set();
            for (const event of events) {
                if (!event.type.startsWith('mouse')) { continue }

                if (event.type === 'mouseup'
                    || event.type === 'mousemove' && this._mouseIn
                    || area.contains(event.position)) {
                    propagationEvents.add(event);
                }
            }

            if (propagationEvents.size > 0) {
                const objects = [...this.objects];
                for (let i = objects.length - 1; i >= 0; i--) {
                    objects[i].handleUIEvent?.(propagationEvents);
                }
            }

            if (!this.eventHandling) { return }

            for (const event of events) {
                if (event.type === 'mousedown') {
                    if (propagationEvents.has(event) && !event.processed) {
                        this.event.emit('mousedown');
                        this._mouseDown = true;
                        event.processed = true;
                    }
                }
                else if (event.type === 'mouseup') {
                    if (area.contains(event.position) && !event.processed) {
                        this.event.emit('mouseup');
                        if (this._mouseDown) {
                            this.event.emit('click');
                        }
                        event.processed = true;
                    }

                    this._mouseDown = false;
                }
                else if (event.type === 'mousemove') {
                    if (area.contains(event.position)) {
                        if (!event.processed) {
                            this.event.emit('mousemove');
                            event.processed = true;
                        }
                        if (!this._mouseIn) {
                            this.event.emit('mousein');
                            this._mouseIn = true;
                        }
                    }
                    else {
                        if (this._mouseIn) {
                            this.event.emit('mouseout');
                            this._mouseIn = false;
                        }
                    }
                }
                else if (event.type === 'mousewheel') {
                    if (propagationEvents.has(event) && !event.processed) {
                        this.event.emit('mousewheel');
                        event.processed = true;
                    }
                }
            }
        }
    }
}