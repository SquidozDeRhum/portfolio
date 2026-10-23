import * as THREE from 'three';

export interface FrameContext {
    bubble_displayed: boolean;
    camera_rotation: THREE.Euler;
    jussemence_position: THREE.Vector3;
};