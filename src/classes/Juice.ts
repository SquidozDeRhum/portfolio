import * as THREE from 'three';

const FRAME_NB = 3;
const ANIMATION_SPEED = 20;
const SPRITE_FILE_NAME = "jussemence";
const SPRITE_FILE_EXTENSION = ".png";

export class Jussemence {
    private _textures: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>[];  
    private _sprite: THREE.Sprite<THREE.Object3DEventMap>;
    private _animation_frame: number;

    constructor(scene: THREE.Scene<THREE.Object3DEventMap>, text_loader: THREE.TextureLoader) {
        this._animation_frame = 0;
        this._textures = [];

        for (let i = 1; i <= FRAME_NB; i++) {
            const text = text_loader.load(`${SPRITE_FILE_NAME}${i}${SPRITE_FILE_EXTENSION}`);
            text.colorSpace = THREE.SRGBColorSpace;
            text.magFilter = THREE.NearestFilter;

            this._textures.push(text);
        }
        
        this._sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._textures[0] }));
        this._sprite.scale.set(1, 2, 1);
        this._sprite.position.set(0, 0, 0);
        scene.add(this._sprite);
    }

    nextFrame(displayed: boolean) {
        const sprite_index = this._animation_frame / ANIMATION_SPEED;
        if (this._animation_frame % ANIMATION_SPEED === 0) {

            if ((!displayed && sprite_index !== FRAME_NB) || (displayed && sprite_index !== FRAME_NB - 1)) {
                this._sprite.material.map = this._textures[sprite_index];
                this._sprite.material.needsUpdate = true;
            }
	    }

	    this._animation_frame++;

        if (this._animation_frame > FRAME_NB * ANIMATION_SPEED){
            this._animation_frame = 1 * ANIMATION_SPEED;
        } else if (displayed && this._animation_frame > (FRAME_NB - 1) * ANIMATION_SPEED) {
            this._animation_frame = 0;
        }
    }
}