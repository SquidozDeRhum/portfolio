import * as THREE from 'three';

import type { FrameContext } from "../interfaces";
import type { KeyboardHandler } from './KeyboardHandler';

export abstract class Actor {
    abstract next_frame(frame_context: FrameContext, keyboard_handler: KeyboardHandler): void;

    abstract get position(): THREE.Vector3 | null;
}