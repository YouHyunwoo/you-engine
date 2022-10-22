import { Stateful } from "./framework/object.js";
import { Camera } from "./camera.js";


export class Scene extends Stateful {

    application = null;
    objects = [];
    ui = [];
    camera = null;

    create(...args) {
        if (this[this.constructor.STATE] === this.constructor.STATES.INSTANTIATED) {
            this.camera = new Camera(this.application.screen);

			this.willCreate(...args);
			this.event.emit('willCreate');
			this[this.constructor.STATE] = this.constructor.STATES.CREATED;
            this.objects.forEach(object => object.create(...args));
            this.ui.forEach(object => object.create(...args));
			this.didCreate(...args);
			this.event.emit('didCreate');
		}
	}

	destroy(...args) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED) {
			this.enable = false;

			this.willDestroy(...args);
			this.event.emit('willDestroy');
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYED;
            this.objects.forEach(object => object.destroy(...args));
            this.ui.forEach(object => object.destroy(...args));
			this.didDestroy(...args);
			this.event.emit('didDestroy');

            this.application = null;
            this.objects = null;
            this.ui = null;
            this.camera = null;
		}
	}

    update(deltaTime, events, input) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate');
            this.objects.forEach(object => object.update(deltaTime, events, input));
            this.ui.forEach(object => object.update(deltaTime, events, input));
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate');
		}
	}

	render(context, screen, screens) {
        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender');

            const camera = this.camera;

            if (camera) {
                context.save();
                context.translate(screen.width / 2, screen.height / 2);
                context.translate(-Math.floor(camera.position[0]), -Math.floor(camera.position[1]));
            }

            this.objects.forEach(object => object.render(context, screen, screens));

            if (camera) {
                context.restore();
            }

            this.ui.forEach(object => object.render(context, screen, screens));

			this.didRender(context, screen, screens);
			this.event.emit('didRender');
		}
	}

    add(object, creation=true) {
        const ui = object.tags.has('ui');
        const target = ui ? this.ui : this.objects;

        target.push(object);
        object.parent = this;

        if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && creation) {
            object.create();
        }
    }

    remove(object, destruction=true) {
        const ui = object.tags.has('ui');
        const target = ui ? this.ui : this.objects;

        const index = target.indexOf(object);

        if (index >= 0) {
            target.splice(index, 1);
            object.parent = null;

            if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && destruction) {
                object.destroy();
            }

            return object;
        }
        else {
            return null;
        }
    }

    find(name) {
        return this.objects.find(object => object.name === name)
                ?? this.ui.find(object => object.name === name)
    }

    findAll(name) {
        return this.objects.filter(object => object.name === name)
                .concat(this.ui.filter(object => object.name === name))
    }

    push(scene, ...enterArgs) {
        this.application.push(scene, ...enterArgs);
    }

    pop(...exitArgs) {
        this.application.pop(...exitArgs);
    }

    transit(scene, { exitArgs=[], enterArgs=[] }={}) {
        this.application.transit(scene, { exitArgs, enterArgs });
    }
}