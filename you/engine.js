import { Loop } from "./framework/loop.js";
import { Event } from "./framework/event.js";
import { Input } from "./framework/input.js";
import { Output } from "./framework/output.js";
import { Screen } from "./screen.js";


class Engine {

	constructor() {
		this.loop = new Loop(this);
		this.event = new Event(this);
		this.input = new Input(this);
		this.output = new Output(this);

		this.applications = [];
	}

	start() {
		this.applications.forEach(app => {
			app.engine = this;
			app.load();
			app.create();
		});

		this.input.connect();
		this.loop.start();
	}

	stop() {
		this.loop.stop();
		this.input.disconnect();

		this.applications.forEach(app => {
			app.destroy();
			app.engine = null;
		});
	}
}

let engine = null;

export function startEngine(configuration) {
	if (engine) {
		engine.stop();
		engine = null;
	}

	engine = new Engine();

	const screens = configuration.screens;
	const applications = configuration.applications;

	Object.keys(screens).forEach(id => {
		const configuration = screens[id];
		const canvas = configuration.canvas;
		const size = configuration.size;
		const screen = new Screen(id, size, canvas);
		engine.output.addScreen(id, screen);
	});
	applications.forEach(app => engine.applications.push(app));

	engine.start();
}