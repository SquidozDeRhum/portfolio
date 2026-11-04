import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Jussemence } from './Juice';
import { Bubble } from './Bubble';
import { Camera } from './Camera';
import type { Actor } from './Actor';
import type { FrameContext } from '../interfaces';

const BACKGROUND_COLOR = 0x87CEEB;

const SKY_LIGHT_COLOR = 0xF2F5FA;
const SKY_GROUND_COLOR = 0xB8BBA8;
const SKY_LIGHT_INTENSITY = 0.2 * Math.PI;

const SUN_COLOR = 0xFFFFFF;
const SUN_INTENSITY = 3;
const SUN_POSITION = new THREE.Vector3(-0.383, 0.643, 0.663).multiplyScalar(15);
const SUN_SHADOW_EXTENT = 12;
const SUN_SHADOW_MAP_SIZE = 2048;
const SUN_SHADOW_SOFTNESS = 3;

const LAND_WIDTH = 20;
const LAND_HEIGHT = 0.5;
const LAND_DEPTH = 20;
const LAND_Y = -1.3;

const CRT_MODEL_PATH = "/crt.glb";
const SHELF_MODEL_PATH = "/shelf.glb";
const STATION_COUNT = 5;
const STATION_RADIUS = 8;
const TV_FRONT_MARGIN = 0.05;

export class WorldHandler {
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _camera: Camera;
    private _sky_light: THREE.HemisphereLight;
    private _sun: THREE.DirectionalLight;
    private _texture_loader: THREE.TextureLoader;

    private _jussemence: Jussemence;
    private _actors: Actor[];

    private _frame_context: FrameContext;

    constructor() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(BACKGROUND_COLOR);

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.toneMapping = THREE.AgXToneMapping;
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFShadowMap;
        document.body.appendChild(this._renderer.domElement);

        this._camera = new Camera();

        this._sky_light = new THREE.HemisphereLight(SKY_LIGHT_COLOR, SKY_GROUND_COLOR, SKY_LIGHT_INTENSITY);
        this._scene.add(this._sky_light);

        this._sun = new THREE.DirectionalLight(SUN_COLOR, SUN_INTENSITY);
        this._sun.position.copy(SUN_POSITION);
        this._sun.castShadow = true;
        this._sun.shadow.mapSize.set(SUN_SHADOW_MAP_SIZE, SUN_SHADOW_MAP_SIZE);
        this._sun.shadow.radius = SUN_SHADOW_SOFTNESS;
        this._sun.shadow.bias = -0.0005;
        this._sun.shadow.normalBias = 0.02;
        const shadow_camera = this._sun.shadow.camera;
        shadow_camera.left = shadow_camera.bottom = -SUN_SHADOW_EXTENT;
        shadow_camera.right = shadow_camera.top = SUN_SHADOW_EXTENT;
        shadow_camera.near = 1;
        shadow_camera.far = 40;
        this._scene.add(this._sun);

        this._texture_loader = new THREE.TextureLoader();
        
        this._jussemence = new Jussemence(this._scene, this._texture_loader);
        this._actors = [
            this._jussemence,
            new Bubble("Bienvenue sur mon portfolio !", this._scene, this._texture_loader)
        ];
        
        this._frame_context = {
            bubble_displayed: false,
            camera_rotation: new THREE.Euler,
            jussemence_position: new THREE.Vector3()
        };

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
        land.receiveShadow = true;

        this._scene.add(land);

        this.place_stations().catch(console.error);
    }

    // a shelf with a TV on its middle deck, at each camera stop around Jussemence
    private async place_stations() {
        const ground_y = LAND_Y + LAND_HEIGHT / 2;

        const loader = new GLTFLoader();
        const [shelf_gltf, crt_gltf] = await Promise.all([
            loader.loadAsync(SHELF_MODEL_PATH),
            loader.loadAsync(CRT_MODEL_PATH)
        ]);

        // both models face +Z: line the TV's front up with the shelf's front
        const shelf_front = new THREE.Box3().setFromObject(shelf_gltf.scene).max.z;
        const crt_front = new THREE.Box3().setFromObject(crt_gltf.scene).max.z;
        const tv_slot = shelf_gltf.scene.getObjectByName("TvSlot")?.position ?? new THREE.Vector3();

        for (let i = 0; i < STATION_COUNT; i++) {
            const angle = (i / STATION_COUNT) * Math.PI * 2;
            const x = Math.sin(angle) * STATION_RADIUS;
            const z = Math.cos(angle) * STATION_RADIUS;

            const station = new THREE.Group();
            station.position.set(x, ground_y, z);
            // turn it towards Jussemence
            station.rotation.y = Math.atan2(-x, -z);

            const crt = crt_gltf.scene.clone(true);
            crt.position.set(tv_slot.x, tv_slot.y, shelf_front - crt_front - TV_FRONT_MARGIN);

            station.add(shelf_gltf.scene.clone(true), crt);
            station.traverse((o) => {
                o.castShadow = true;
                o.receiveShadow = true;
            });
            this._scene.add(station);
        }
    }

    get renderer() {
        return this._renderer;
    }

    handle_world() {
        this._frame_context.camera_rotation = this._camera.rotation;
        this._frame_context.jussemence_position = this._jussemence.position;

        this._actors.forEach((a) => a.next_frame(this._frame_context));

        this._camera.next_frame();

        this._renderer.render(this._scene, this._camera.camera);
    }
}