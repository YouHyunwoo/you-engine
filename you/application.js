import { BaseObject } from "./object.js";


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

		super.render(screens[this.mainScreen].context, screens);
	}
}