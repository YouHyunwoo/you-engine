import { Application } from "../../../you/application.js";
import { Maze } from "./maze.js";


export class MazeGeneration extends Application {

	constructor() {
		super();

		this.mainScreen = 'default';

		this.maze = new Maze(20, 20);
		this.maze.spawn(0, 0);

		this.progress = 0;
		this.finished = false;
	}

	didUpdate(deltaTime, events, input) {
		if (this.maze.finished) {
			return;
		}

		if (this.progress > 10) {
			this.maze.travel();

			this.progress -= 10;
		}

		this.progress += deltaTime;
	}

	didRender(context, screens) {
		const tileSize = [
			Math.floor(context.canvas.width / this.maze.width),
			Math.floor(context.canvas.height / this.maze.height),
		];

		this.maze.render(context, tileSize);
	}
}