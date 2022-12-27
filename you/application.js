import { Loopable } from "./framework/object.js";


export class Application extends Loopable {

	engine = null;
	mainScreen = null;

	constructor({
		events={},
		mainScreen=null,
	}={}) {
		super({
			events,
		});

		this.mainScreen = mainScreen;
	}

	get screen() { return this.engine.output.screens[this.mainScreen] }

	render(screens) {
		Object.keys(screens).forEach(screenId => {
			const screen = screens[screenId];

			screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
		});

		const mainScreen = screens[this.mainScreen];
		const mainScreenContext = mainScreen.context;

		super.render(mainScreenContext, mainScreen, screens);
	}
}

export class SceneApplication extends Application {

	scenes = [];
	queue = [];

	push(scene, ...args) {
		this.queue.push({ type:'push', scene, args });
	}

	pop(...args) {
		this.queue.add({ type: 'pop', args });
	}

	transit(scene, { exitArgs=[], enterArgs=[] }={}) {
		this.pop(...exitArgs);
		this.push(scene, ...enterArgs);
	}

	update(...args) {
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (item.type === 'push') {
				const scene = item.scene;
				this.scenes.unshift(scene);
				scene.application = this;
				scene.create(...item.args);
			}
			else if (item.type === 'pop') {
				const scene = this.scenes.shift();
				scene.destroy(...item.args);
				scene.application = null;
			}
		}

		this.willUpdate(...args);
		this.scenes[0]?.update(...args);
		this.didUpdate(...args);
	}

	render(screens) {
		Object.keys(screens).forEach(screenId => {
			const screen = screens[screenId];

			screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
		});

		const mainScreen = screens[this.mainScreen];
		const mainScreenContext = mainScreen.context;

		this.willRender(mainScreenContext, mainScreen, screens);
		this.scenes[0]?.render(mainScreenContext, mainScreen, screens);
		this.didRender(mainScreenContext, mainScreen, screens);
	}
}