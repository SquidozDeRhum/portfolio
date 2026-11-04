import * as THREE from 'three';
import { Actor } from './Actor';
import { round_number_to_two_decimals } from '../utils';
import type { KeyboardHandler } from './KeyboardHandler';
import type { FrameContext } from '../interfaces';

const FOV = 75;
const NEAR = 0.1;
const FAR = 1000;

const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = 0.07;

const DELTA = 0.3;
const TRAVELLING_SPEED = 0.08;

const TWO_PI = 2 * Math.PI;

interface Position {
    x: number;
    z: number;
    y_rotation: number;
}

export class Camera extends Actor {
    private _camera: THREE.PerspectiveCamera;

    private _positions: Position[];
    private _current_position: number;
    private _travelling: boolean;

    constructor() {
        super();

        this._camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
        this._camera.position.z = 5;

        this._positions = [];
        this._current_position = 0;
        this._travelling = false;

        this.get_positions_from_server();
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

    set position(position: THREE.Vector3) {
        this._camera.position.set(position.x, position.y, position.z);
    }

    // this works, for pity’s sake, so I never have to touch it again
    handle_movement(keyboard_handler: KeyboardHandler) {
        const z = (keyboard_handler.keys.z ? -1 : 0) + (keyboard_handler.keys.s ? 1 : 0);
        const x = (keyboard_handler.keys.q ? -1 : 0) + (keyboard_handler.keys.d ? 1 : 0);

        // const x_rotation = (this._keys.ArrowUp ? 1 : 0) + (this._keys.ArrowDown ? -1 : 0)
        const y_rotation = (keyboard_handler.keys.ArrowLeft ? 1 : 0) + (keyboard_handler.keys.ArrowRight ? -1 : 0)

        this._camera.position.z += (z * Math.cos(this._camera.rotation.y) + x * Math.cos(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;
        this._camera.position.x += (z * Math.sin(this._camera.rotation.y) + x * Math.sin(this._camera.rotation.y + (Math.PI / 2))) * MOVEMENT_SPEED;

        // this._camera.rotation.x += x_rotation * ROTATION_SPEED;
        this._camera.rotation.y += y_rotation * ROTATION_SPEED;
    }

    async send_positions_to_server() {
        try {
            const result = await fetch('/api/positions', {
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

    async get_positions_from_server() {
        try {
            const result = await fetch('/api/positions', {
                method: 'GET' 
            });

            if (!result.ok) throw new Error("An error occured during positions get ;(");

            const data: Position[] = (await result.json()).positions;

            this._positions = data;
        } catch (error: any) {
            console.log(error);
        }
    }

    go_to_next_position(keyboard_handler: KeyboardHandler) {
        if (keyboard_handler.keys.n && !keyboard_handler.keys_pressed_last_frame.n) {
            this._travelling = true;
        }

        if (this._travelling) {
            const next_position = this._positions[this._current_position];
            const distance = Math.sqrt((next_position.x - this.position.x)**2 + (next_position.z - this.position.z)**2);
    
            if (distance > DELTA) {
                const x_direction = next_position.x - this.position.x;
                const z_direction = next_position.z - this.position.z;

                const step = Math.min(TRAVELLING_SPEED, distance);

                this.position = new THREE.Vector3(
                    this.position.x + (x_direction / distance) * step, 
                    this.position.y, 
                    this.position.z + (z_direction / distance) * step
                );

                const new_distance = Math.sqrt((this.position.x - next_position.x)**2 + (this.position.z - next_position.z)**2);
                const difference = distance - new_distance;

                let rotation_distance = next_position.y_rotation - this.rotation.y;
                rotation_distance = ((rotation_distance + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;

                const jaaj = (difference/distance);

                this._camera.rotation.y += rotation_distance * jaaj;
            } else {
                this._travelling = false;
                this._current_position++;

                if (this._current_position === this._positions.length) this._current_position = 0;
            }
        }
    }

    handle_positions(keyboard_handler: KeyboardHandler) {
        if (keyboard_handler.keys[' '] && !keyboard_handler.keys_pressed_last_frame[' ']) {
            this._positions.push({
                x: round_number_to_two_decimals(this.position.x),
                z: round_number_to_two_decimals(this.position.z),
                y_rotation: round_number_to_two_decimals(this.rotation.y)
            })
        }

        if (keyboard_handler.keys.Enter && !keyboard_handler.keys_pressed_last_frame.Enter) {
            this.send_positions_to_server();
        }

        if (keyboard_handler.keys.r && !keyboard_handler.keys_pressed_last_frame.r) {
            this._positions = [];
        }
    }

    next_frame(_frame_context: FrameContext, keyboard_handler: KeyboardHandler) {
        this.handle_movement(keyboard_handler);
        this.go_to_next_position(keyboard_handler);
        this.handle_positions(keyboard_handler);
    }
}