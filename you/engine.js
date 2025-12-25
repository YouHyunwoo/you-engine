import { Loop } from "./framework/loop.js";
import { Event } from "./framework/event.js";
import { Input } from "./framework/input.js";
import { Output } from "./framework/output.js";
import { CanvasScreen } from "./screen.js";


export class Engine {

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

export function run(configuration) {
	if (engine !== null)
		engine.stop();

	engine = new Engine();
	configureEngine(configuration, engine);
	engine.start();
}

function configureEngine(configurations, engine) {
	configureScreen(configurations.screens, engine);
	configureApplications(configurations.applications, engine);
}

function configureScreen(screenConfigurations, engine) {
	if (screenConfigurations == null) {
		const id = 'default';
		const size = [800, 600];
		const canvasElement = document.createElement('canvas');
		canvasElement.width = size[0];
		canvasElement.height = size[1];
		document.body.appendChild(canvasElement);
		screenConfigurations = {
			[id]: {
				canvas: canvasElement,
				size: size,
			},
		};
		console.warn(`No screens configured for the engine. A default screen (${id}) has been created.`);
	}

	Object.keys(screenConfigurations).forEach(id => {
		const configuration = screenConfigurations[id];
		const canvasElement = configuration.canvas;
		const size = configuration.size;
		const screen = new CanvasScreen(id, size, canvasElement);
		engine.output.addScreen(id, screen);
	});
}

function configureApplications(applications, engine) {
	if (applications == null) {
		console.warn('No applications configured for the engine.');
		return;
	}

	applications.forEach(app => engine.applications.push(app));
}