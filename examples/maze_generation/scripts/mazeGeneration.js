import { Application } from "../../../you/application.js";
import { Maze } from "./maze.js";


export class MazeGeneration extends Application {

	constructor({
		events={},
		mainScreen=null,
	}={}) {
		super({
			events,
			mainScreen,
		});

		this.maze = new Maze(20, 20);
		this.maze.spawn(0, 0);

		this.progress = 0;
		this.finished = false;
	}

	didUpdate(deltaTime, events, input) {
		if (this.maze.finished) {
			return;
		}

		if (this.progress > 1) {
			this.maze.travel();

			this.progress -= 1;
		}

		this.progress += deltaTime * 100;
	}

	didRender(context, screens) {
		const tileSize = [
			Math.floor(context.canvas.width / this.maze.width),
			Math.floor(context.canvas.height / this.maze.height),
		];

		this.maze.render(context, tileSize);
	}
}