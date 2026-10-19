import * as THREE from 'three';

const FRAME_NB = 3;
const ANIMATION_SPEED = 20;
const SPRITE_FILE_NAME = "jussemence";
const SPRITE_FILE_EXTENSION = ".png";

export class Jussemence {
    private texts: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>[];  
    private sprite: THREE.Sprite<THREE.Object3DEventMap>;
    private animation_frame: number;

    constructor(scene: THREE.Scene<THREE.Object3DEventMap>, text_loader: THREE.TextureLoader) {
        this.animation_frame = 0;
        this.texts = [];

        for (let i = 1; i <= FRAME_NB; i++) {
            const text = text_loader.load(`${SPRITE_FILE_NAME}${i}${SPRITE_FILE_EXTENSION}`);
            text.colorSpace = THREE.SRGBColorSpace;
            text.magFilter = THREE.NearestFilter;

            this.texts.push(text);
        }
        
        this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.texts[0] }));
        this.sprite.scale.set(1, 2, 1);
        this.sprite.position.set(0, 0, 0);
        scene.add(this.sprite);
    }

    nextFrame(displayed: boolean) {
        const sprite_index = this.animation_frame / ANIMATION_SPEED;
        if (this.animation_frame % ANIMATION_SPEED === 0) {

            if ((!displayed && sprite_index !== FRAME_NB) || (displayed && sprite_index !== FRAME_NB - 1)) {
                this.sprite.material.map = this.texts[sprite_index];
                this.sprite.material.needsUpdate = true;
            }
	    }

	    this.animation_frame++;

        if (this.animation_frame > FRAME_NB * ANIMATION_SPEED){
            this.animation_frame = 1 * ANIMATION_SPEED;
        } else if (displayed && this.animation_frame > (FRAME_NB - 1) * ANIMATION_SPEED) {
            this.animation_frame = 0;
        }
    }
}