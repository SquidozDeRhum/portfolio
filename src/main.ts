import { WorldHandler } from './classes/WorldHandler';

const worldHandler = new WorldHandler();

function animate(_time: number) {
	worldHandler.handleWorld();
}

worldHandler.renderer.setAnimationLoop(animate);