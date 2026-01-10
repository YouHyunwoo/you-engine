import { You } from "../../../you/you.js";
import { DefenseGame } from "./game.js";

const configurations = {
	screens: {
		default: {
			canvas: document.querySelector('canvas'),
			size: [900, 600],
		},
	},
	applications: [
		new DefenseGame({ mainScreen: 'default' }),
	],
};

You.run(configurations);
