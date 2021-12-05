import { Input } from "./input.js";
import { Output } from "./output.js";


export class Engine {

	constructor() {
		this.lastTime = 0;
		this.loopCallback = this.loop.bind(this);
		this.loopHandle = null;

		this.input = new Input(this);
		this.output = new Output(this);

		this.events = [];

		this.app = null;
	}

	setApplication(app) {
		this.app = app;
		this.app.engine = this;
		this.app.create();
	}

	start() {
		this.lastTime = 0;

		window.requestAnimationFrame(t => {
			this.lastTime = t;
			this.loopHandle = window.requestAnimationFrame(this.loopCallback);
		});
	}

	stop() {
		this.loopHandle = null;
	}

	loop(elapsedTime) {
		const deltaTime = elapsedTime - this.lastTime;
		this.lastTime = elapsedTime;

		this.app.update(deltaTime, this.events, this.input);
		this.app.render(this.output.screens);

		this.events = [];

		if (this.loopHandle) {
			this.loopHandle = window.requestAnimationFrame(this.loopCallback);
		}
		else {
			this.app.destroy();
		}
	}
}