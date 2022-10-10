import { Base as BaseObject } from "./framework/object.js";
import { EventEmitter } from "./utilities/event.js";
import { Camera } from "./camera.js";


export class Scene extends BaseObject {

    constructor({
        events={}
    }={}) {
        super();

        this.event = new EventEmitter(this);
        Object.keys(events).forEach(event => this.event.on(event, events[event]));

        this._created = false;

        this.application = null;
        this.objects = [];
        this.ui = [];

        this.camera = null;
    }

    create(...args) {
        this.camera = new Camera(this.application.screen);
		this.willCreate(...args);
        this.objects.forEach(object => object.create(...args));
        this.ui.forEach(object => object.create(...args));
        this._created = true;
		this.didCreate(...args);
	}

	destroy(...args) {
		this.willDestroy(...args);
        this.objects.forEach(object => object.destroy(...args));
        this.ui.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
        this.camera = null;
	}

    update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
        this.objects.forEach(object => object.update(deltaTime, events, input));
        this.ui.forEach(object => object.update(deltaTime, events, input));
		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);
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
	}

    add(object) {
        const ui = object.tags.has('ui');
        const target = ui ? this.ui : this.objects;

        target.push(object);
        object.parent = this;
        if (this._created) {
            object.create();
        }
    }

    remove(object, destroy=true) {
        const ui = object.tags.has('ui');
        const target = ui ? this.ui : this.objects;

        const index = target.indexOf(object);

        if (index >= 0) {
            target.splice(index, 1);
            object.parent = null;
            if (this._created && destroy) {
                object.destroy();
            }
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