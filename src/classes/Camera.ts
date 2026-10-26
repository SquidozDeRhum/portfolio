import * as THREE from 'three';
import { Actor } from './Actor';
import { round_number_to_two_decimals } from '../utils';

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
    Enter: boolean;
    ' ': boolean;
};

interface Position {
    x: number;
    z: number;
    y_rotation: number;
}

export class Camera extends Actor {
    private _camera: THREE.PerspectiveCamera;
    private _keys: Keys;
    private _positions: Position[];

    private _space_pressed_last_frame: boolean;
    private _enter_pressed_last_frame: boolean;

    constructor() {
        super();

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
            ArrowRight: false,
            Enter: false,
            " ": false
        };

        this._positions = [];

        this._space_pressed_last_frame = false;
        this._enter_pressed_last_frame = false;

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

    get position() {
        return this._camera.position;
    }

    get rotation() {
        return this._camera.rotation;
    }

    // this works, for pity’s sake, so I never have to touch it again
    handle_movement() {
        const z = (this._keys.z ? -1 : 0) + (this._keys.s ? 1 : 0);
        const x = (this._keys.q ? -1 : 0) + (this._keys.d ? 1 : 0);

        // const x_rotation = (this._keys.ArrowUp ? 1 : 0) + (this._keys.ArrowDown ? -1 : 0)
        const y_rotation = (this._keys.ArrowLeft ? 1 : 0) + (this._keys.ArrowRight ? -1 : 0)

        this._camera.position.z += (z * Math.cos(this._camera.rotation.y) + x * Math.cos(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;
        this._camera.position.x += (z * Math.sin(this._camera.rotation.y) + x * Math.sin(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;

        // this._camera.rotation.x += x_rotation * ROTATION_SPEED;
        this._camera.rotation.y += y_rotation * ROTATION_SPEED;
    }

    async send_positions_to_server() {
        try {
            const result = await fetch('/api/send_positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ positions: this._positions })
            });

            if (!result.ok) throw new Error("An error occured during positions send ;(");

            const data = await result.json();

            console.log(data);
        } catch (error: any) {
            console.log(error);
        }
    }

    handle_positions() {
        if (this._keys[' '] === true && !this._space_pressed_last_frame) {
            this._positions.push({
                x: round_number_to_two_decimals(this.position.x),
                z: round_number_to_two_decimals(this.position.z),
                y_rotation: round_number_to_two_decimals(this.rotation.y)
            })
        }

        if (this._keys.Enter === true && !this._enter_pressed_last_frame) {
            this.send_positions_to_server();
        }

        this._space_pressed_last_frame = this._keys[' '];
        this._enter_pressed_last_frame = this._keys.Enter;
    }

    next_frame() {
        this.handle_movement();
        this.handle_positions();
    }
}