import { Base as BaseObject } from "../../../libraries/you/framework/object.js";
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

        this.tasks = tasks;
        this.finished = tasks.map(t => false);

        tasks.forEach(task => {
            task.procedure = this;
        });
    }

    update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
		this.tasks.forEach((object, index) => {
            if (this.finished[index] === false) {
                object.update(deltaTime, events, input);
            }
        });
		this.didUpdate(deltaTime, events, input);
	}

    render(context, screen, screens) {
		this.willRender(context, screen, screens);
        this.tasks.forEach((object, index) => {
            if (this.finished[index] === false) {
                object.render(context, screen, screens);
            }
        });
		this.didRender(context, screen, screens);
	}

    finish(task) {
        const index = this.tasks.indexOf(task);
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

        this.tasks = [];
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

	update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);

		const object = this.tasks[this.currentTaskIndex];
		object?.update(deltaTime, events, input);

		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);

		const object = this.tasks[this.currentTaskIndex];
		object?.render(context, screen, screens);

		this.didRender(context, screen, screens);
	}

    add(task) {
        if (task === null) { return }

        this.tasks.push(task);
        task.procedure = this;
    }

    remove(task) {
        if (task === null) { return }

        const index = this.tasks.indexOf(task);
        if (index >= 0) {
            this.tasks.splice(index, 1);
            task.procedure = null;
        }
    }

    finish(task) {
        this.currentTaskIndex = Math.min(this.currentTaskIndex + 1, this.tasks.length);

		if (this.currentTaskIndex === this.tasks.length) {
            this.event.emit('finish');
		}
    }
}