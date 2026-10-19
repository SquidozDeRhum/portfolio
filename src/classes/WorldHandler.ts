import * as THREE from 'three';
import { Jussemence } from './Juice';
import { Bubble } from './Bubble';
import { Camera } from './Camera';

const BACKGROUND_COLOR = 0x87CEEB;

const AMBIENT_LIGHT_COLOR = 0xFFFFFF;
const AMBIENT_LIGHT_INTENSITY = 1;

const LAND_WIDTH = 20;
const LAND_HEIGHT = 0.5;
const LAND_DEPTH = 20;

export class WorldHandler {
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _camera: Camera;
    private _ambient_light: THREE.AmbientLight;
    private _texture_loader: THREE.TextureLoader;
    private _jussemence: Jussemence;
    private _bubble: Bubble;

    constructor() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(BACKGROUND_COLOR);

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);

        this._camera = new Camera();

        this._ambient_light = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);
        this._scene.add(this._ambient_light);
        
        this._texture_loader = new THREE.TextureLoader();

        this._jussemence = new Jussemence(this._scene, this._texture_loader);

        this._bubble = new Bubble("HDQSFUOIDHUIQOSD UIFHDUIFDSH  UIFDSHUIFSD ", this._scene, this._texture_loader);

        // test field

        const land_geometry = new THREE.BoxGeometry(LAND_WIDTH, LAND_HEIGHT, LAND_DEPTH);
        const land_texture = this._texture_loader.load("/grass.png");
        land_texture.colorSpace = THREE.SRGBColorSpace;
        land_texture.wrapS = THREE.RepeatWrapping;
        land_texture.wrapT = THREE.RepeatWrapping;
        land_texture.repeat.set(5, 5);
        land_texture.needsUpdate = true;

        const land_material = new THREE.MeshStandardMaterial({ map: land_texture});

        const land = new THREE.Mesh(land_geometry, land_material);
        land.position.set(land.position.x, -1.3, land.position.z);

        this._scene.add(land);
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