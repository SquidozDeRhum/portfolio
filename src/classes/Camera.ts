import * as THREE from 'three';

const FOV = 75;
const NEAR = 0.1;
const FAR = 1000;

export interface Keys {
	z: boolean;
	q: boolean;
	s: boolean;
	d: boolean;
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
            d: false
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

    checkMovement() {
        const z = (this._keys.z ? -1 : 0) + (this._keys.s ? 1 : 0);
        const x = (this._keys.q ? -1 : 0) + (this._keys.d ? 1 : 0);

        this._camera.position.z += z * 0.1;
        this._camera.position.x += x * 0.1;
    }
}