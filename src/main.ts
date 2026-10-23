import { WorldHandler } from './classes/WorldHandler';

const worldHandler = new WorldHandler();

function animate(_time: number) {
	worldHandler.handle_world();
}

worldHandler.renderer.setAnimationLoop(animate);