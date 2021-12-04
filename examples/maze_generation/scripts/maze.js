import { Engine } from "../../../you/engine.js";
import { BaseObject } from "../../../you/object.js";


const DIRECTION = [
	[-1, 0],
	[+1, 0],
	[0, -1],
	[0, +1],
];


class Maze {

	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.map = [];
		for (let r = 0; r < this.height; r++) {
			const row = [];
			for (let c = 0; c < this.width; c++) {
				row.push(0);
			}
			this.map.push(row);
		}

		this.generator = null;
		this.trace = [];

		this.finished = false;

		this.excludeBacktracking = true;
	}

	spawn(x, y) {
		this.generator = [x, y];
	}

	travel() {
		let candidates = null;

		do {
			candidates = this.findCandidates();

			if (candidates.length > 0) {
				break;
			}

			this.backtrack();
		} while (!this.finished && this.excludeBacktracking);

		if (candidates.length > 0) {
			const direction = this.chooseDirection(candidates);
			this.move(direction);
		}
	}

	findCandidates() {
		const candidates = [];

		for (let i = 0; i < 4; i++) {
			const [dx, dy] = DIRECTION[i];
			const [x, y] = [this.generator[0] + dx, this.generator[1] + dy];
			if (this.isMoveable(x, y)) {
				candidates.push(i);
			}
		}

		return candidates;
	}

	isMoveable(x, y) {
		return this.map?.[y]?.[x] === 0;
	}

	chooseDirection(directions) {
		return directions[Math.floor(Math.random() * directions.length)];
	}

	move(direction) {
		this.trace.push([...this.generator]);
		this.map[this.generator[1]][this.generator[0]] += 2 ** direction;

		const [dx, dy] = DIRECTION[direction];
		this.generator[0] += dx;
		this.generator[1] += dy;
	}

	backtrack() {
		if (this.trace.length === 0) {
			this.finished = true;
			return;
		}

		if (this.map[this.generator[1]][this.generator[0]] === 0) {
			this.map[this.generator[1]][this.generator[0]] = 16;
		}

		this.generator = this.trace.pop();
	}

	render(context, tileSize=[10, 10]) {
		context.save();

		const borderSize = [1, 1];
		const tileSizeWithoutBorder = [
			tileSize[0] - borderSize[0], tileSize[1] - borderSize[1]
		];

		for (let r = 0; r < this.map.length; r++) {
			const row = this.map[r];

			for (let c = 0; c < row.length; c++) {
				const v = row[c];

				context.fillStyle = v === 0 ? 'black' : 'white';
				context.fillRect(
					c * tileSize[0], r * tileSize[1],
					...tileSizeWithoutBorder
				);

				if ((v & 1) === 1) {
					context.fillRect(
						c * tileSize[0] - borderSize[0], r * tileSize[1],
						borderSize[0], tileSizeWithoutBorder[1]
					);
				}
				if ((v & 2) === 2) {
					context.fillRect(
						c * tileSize[0] + tileSizeWithoutBorder[0], r * tileSize[1],
						borderSize[0], tileSizeWithoutBorder[1]
					);
				}
				if ((v & 4) === 4) {
					context.fillRect(
						c * tileSize[0], r * tileSize[1] - borderSize[1],
						tileSizeWithoutBorder[0], borderSize[1]
					);
				}
				if ((v & 8) === 8) {
					context.fillRect(
						c * tileSize[0], r * tileSize[1] + tileSizeWithoutBorder[1],
						tileSizeWithoutBorder[0], borderSize[1]
					);
				}
			}
		}

		if (this.generator) {
			context.fillStyle = 'rgba(0, 255, 0, 0.5)';
			context.fillRect(
				this.generator[0] * tileSize[0],
				this.generator[1] * tileSize[1],
				...tileSizeWithoutBorder
			);
		}

		context.restore();
	}
}

class MazeGenerator extends BaseObject {

	constructor() {
		super();

		this.maze = new Maze(20, 20);
		this.maze.spawn(0, 0);

		this.progress = 0;
		this.finished = false;
	}

	update(deltaTime, events, input) {
		if (this.maze.finished) {
			return;
		}

		if (this.progress > 10) {
			this.maze.travel();

			this.progress -= 10;
		}

		this.progress += deltaTime;
	}

	render(context) {
		const tileSize = [
			Math.floor(SCREEN_WIDTH / this.maze.width),
			Math.floor(SCREEN_HEIGHT / this.maze.height),
		];

		this.maze.render(context, tileSize);
	}
}



const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 400;

const engine = new Engine([SCREEN_WIDTH, SCREEN_HEIGHT]);

engine.objects.push(new MazeGenerator());

engine.start();