import { Base as BaseObject } from "./framework/object.js";


export class Scene extends BaseObject {

    constructor() {
        super();

        this.application = null;
        this.objects = [];
    }

    create(...args) {
		this.willCreate(...args);
        this.objects.forEach(object => object.create(...args));
		this.didCreate(...args);
	}

	destroy(...args) {
		this.willDestroy(...args);
        this.objects.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
	}

    update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
        this.objects.forEach(object => object.update(deltaTime, events, input));
		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);
        this.objects.forEach(object => object.render(context, screen, screens));
		this.didRender(context, screen, screens);
	}

    add(object) {
        this.objects.push(object);
        object.parent = this;
    }

    remove(object) {
        const index = this.objects.indexOf(object);

        if (index >= 0) {
            this.objects.splice(index, 1);
            object.parent = null;
        }
    }

    find(name) {
        return this.objects.find(object => object.name === name);
    }

    findAll(name) {
        return this.objects.filter(object => object.name === name);
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