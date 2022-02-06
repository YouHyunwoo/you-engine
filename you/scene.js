import { Base as BaseObject } from "./framework/object.js";


export class Scene extends BaseObject {

    constructor() {
        super();

        this.application = null;
        this.objects = [];
        this.ui = [];

        this.camera = [0, 0];
    }

    create(...args) {
		this.willCreate(...args);
        this.objects.forEach(object => object.create(...args));
        this.ui.forEach(object => object.create(...args));
		this.didCreate(...args);
	}

	destroy(...args) {
		this.willDestroy(...args);
        this.objects.forEach(object => object.destroy(...args));
        this.ui.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
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
            context.translate(-Math.floor(camera[0]), -Math.floor(camera[1]));
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
        object.create();
    }

    remove(object) {
        const ui = object.tags.has('ui');
        const target = ui ? this.ui : this.objects;

        const index = target.indexOf(object);

        if (index >= 0) {
            target.splice(index, 1);
            object.parent = null;
            object.destroy();
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

    push(scene, enterArgs) {
        this.application.push(scene, enterArgs);
    }

    pop(exitArgs) {
        this.application.pop(exitArgs);
    }

    transit(scene, exitArgs, enterArgs) {
        this.application.transit(scene, exitArgs, enterArgs);
    }
}