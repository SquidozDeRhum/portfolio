import * as THREE from 'three';

import type { FrameContext } from "../interfaces";

export abstract class Actor {
    abstract next_frame(frame_context: FrameContext): void;

    abstract get position(): THREE.Vector3 | null;
}