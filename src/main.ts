import * as THREE from 'three';
import { Jussemence } from './juice';
import { Bubble } from './bubble';

const BACKGROUND_COLOR = 0x87CEEB;

const FOV = 75;
const NEAR = 0.1;
const FAR = 1000;

const scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const text_loader = new THREE.TextureLoader();

// Here add jussemence
const juice = new Jussemence(scene, text_loader);

const bubble = new Bubble("Baril de caca puant sa mère j'ai pas envie de sentir", scene, text_loader);

camera.position.z = 5;

let direction = 1;

function animate(_time: number) {
	// Here animate jussemence
	juice.nextFrame(bubble.displayed);

	bubble.nextChar();

	camera.position.z += 0.01 * direction;

	if (camera.position.z > 8) {
		direction = -1;
	} else if (camera.position.z < 5) {
		direction = 1;
	}

  	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);