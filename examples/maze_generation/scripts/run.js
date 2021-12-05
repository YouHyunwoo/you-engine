import { Engine } from "../../../you/engine.js";
import { Screen } from "../../../you/screen.js";
import { MazeGeneration } from "./mazeGeneration.js";


const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 400;


const engine = new Engine();

engine.output.addScreen(
    'default',
    new Screen(document.querySelector('canvas'), SCREEN_WIDTH, SCREEN_HEIGHT)
);

engine.setApplication(new MazeGeneration());

engine.start();