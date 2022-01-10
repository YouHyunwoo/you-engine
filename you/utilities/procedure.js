import { BaseObject } from "../../../libraries/you/object.js";
import { EventEmitter } from "../../../libraries/you/utilities/event.js";


export class Task extends BaseObject {

	constructor() {
		super();

		this.procedure = null;
	}

    finish() { this.procedure?.finish(this) }
}

export class Parallel extends Task {

    constructor(tasks) {
        super();

        this.objects = tasks;
        this.finished = tasks.map(t => false);

        tasks.forEach(task => {
            task.procedure = this;
        });
    }

    update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
		this.objects.forEach((object, index) => {
            if (this.finished[index] === false) {
                object.update(deltaTime, events, input);
            }
        });
		this.didUpdate(deltaTime, events, input);
	}

    render(context, screen, screens) {
		this.willRender(context, screen, screens);
        this.objects.forEach((object, index) => {
            if (this.finished[index] === false) {
                object.render(context, screen, screens);
            }
        });
		this.didRender(context, screen, screens);
	}

    finish(task) {
        const index = this.objects.indexOf(task);
        this.finished[index] = true;

        if (this.finished.every(finished => finished)) {
            this.procedure?.finish(this);
        }
    }
}

export class Procedure extends BaseObject {

    constructor(tasks) {
		super();

        this.event = new EventEmitter();

        this.currentTaskIndex = 0;

        for (const task of tasks) {
            if (task instanceof Array) {
                const parallel = new Parallel(task);
                this.add(parallel);
            }
            else {
                this.add(task);
            }
        }
	}

    get tasks() { return this.objects }

	update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);

		const object = this.objects[this.currentTaskIndex];
		object?.update(deltaTime, events, input);

		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);

		const object = this.objects[this.currentTaskIndex];
		object?.render(context, screen, screens);

		this.didRender(context, screen, screens);
	}

    add(task) {
        if (task === null) { return }

        this.objects.push(task);
        task.procedure = this;
    }

    remove(task) {
        if (task === null) { return }

        const index = this.objects.indexOf(task);
        if (index >= 0) {
            this.objects.splice(index, 1);
            task.procedure = null;
        }
    }

    finish(task) {
        this.currentTaskIndex = Math.min(this.currentTaskIndex + 1, this.objects.length);

		if (this.currentTaskIndex === this.objects.length) {
            this.event.emit('finish');
		}
    }
}