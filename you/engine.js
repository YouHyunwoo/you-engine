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

export function startEngine(config) {
	if (engine) {
		engine.stop();
		engine = null;
	}

	engine = new Engine();

	const screens = config.screens;
	const applications = config.applications;

	Object.keys(screens).forEach(id => addScreen(id, screens[id]));
	applications.forEach(app => addApplication(app));

	engine.start();
}

function addScreen(id, screenInformation) {
	const canvas = screenInformation.canvas;
	const size = screenInformation.size;

	const screen = new Screen(canvas, ...size);

	engine.output.addScreen(id, screen);
}

function addApplication(application) {
	engine.applications.push(application);
}