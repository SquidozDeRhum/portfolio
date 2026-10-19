import * as THREE from 'three';

const FOV = 75;
const NEAR = 0.1;
const FAR = 1000;

const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = 0.07;

export interface Keys {
	z: boolean;
	q: boolean;
	s: boolean;
	d: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
};

export class Camera {
    private _camera: THREE.PerspectiveCamera;
    private _keys: Keys;

    constructor() {
        this._camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
        this._camera.position.z = 5;

        this._keys = {
            z: false,
            q: false,
            s: false,
            d: false,
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        document.addEventListener("keydown", (e) => {
            if (e.repeat) return;

            if (e.key in this._keys) {
                this._keys[e.key as keyof Keys] = true;
            }
        });

        document.addEventListener("keyup", (e) => {
            if (e.key in this._keys) {
                this._keys[e.key as keyof Keys] = false;
            }
        });
    }

    get camera() {
        return this._camera;
    }

    // this works, for pity’s sake, so I never have to touch it again
    checkMovement() {
        const z = (this._keys.z ? -1 : 0) + (this._keys.s ? 1 : 0);
        const x = (this._keys.q ? -1 : 0) + (this._keys.d ? 1 : 0);

        const x_rotation = (this._keys.ArrowUp ? 1 : 0) + (this._keys.ArrowDown ? -1 : 0)
        const y_rotation = (this._keys.ArrowLeft ? 1 : 0) + (this._keys.ArrowRight ? -1 : 0)

        this._camera.position.z += (z * Math.cos(this._camera.rotation.y) + x * Math.cos(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;
        this._camera.position.x += (z * Math.sin(this._camera.rotation.y) + x * Math.sin(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;

        this._camera.rotation.x += x_rotation * ROTATION_SPEED;
        this._camera.rotation.y += y_rotation * ROTATION_SPEED;
    }
}