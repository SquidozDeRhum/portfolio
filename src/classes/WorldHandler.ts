import * as THREE from 'three';
import { Jussemence } from './Juice';
import { Bubble } from './Bubble';
import { Camera } from './Camera';

const BACKGROUND_COLOR = 0x87CEEB;

export class WorldHandler {
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _texture_loader: THREE.TextureLoader;
    private _camera: Camera;
    private _jussemence: Jussemence;
    private _bubble: Bubble;

    constructor() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(BACKGROUND_COLOR);

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);

        this._texture_loader = new THREE.TextureLoader();

        this._camera = new Camera();

        this._jussemence = new Jussemence(this._scene, this._texture_loader);

        this._bubble = new Bubble("HDQSFUOIDHUIQOSD UIFHDUIFDSH  UIFDSHUIFSD ", this._scene, this._texture_loader);
    }

    get renderer() {
        return this._renderer;
    }

    handleWorld() {
        this._jussemence.nextFrame(this._bubble.displayed);

        this._bubble.nextChar();

        this._camera.checkMovement();

        this._renderer.render(this._scene, this._camera.camera);
    }
}