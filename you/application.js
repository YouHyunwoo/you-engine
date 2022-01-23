import { Base as BaseObject } from "./framework/object.js";


export class Application extends BaseObject {

	constructor() {
		super();

		this.engine = null;
		this.mainScreen = null;
	}

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

	constructor() {
		super();

		this.scenes = [];
	}

	push(scene, ...args) {
		this.scenes.unshift(scene);
		scene.application = this;
		scene.create(...args);

		this?.engine?.input.clear();
	}

	pop(...args) {
		const scene = this.scenes.shift();
		scene.destroy(...args);
		scene.application = null;

		return scene;
	}

	transit(scene, exitArgs, enterArgs) {
		const oldScene = this.pop(...(exitArgs ?? []));
		this.push(scene, ...(enterArgs ?? []));
		return oldScene;
	}

	update(...args) {
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