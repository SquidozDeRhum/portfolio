import * as THREE from 'three';
import { Actor } from './Actor';
import type { FrameContext } from '../interfaces';

const SPRITE_FILE_NAME = "bubble.png";
const MAX_CHAR_PER_LINE = 18;
const TEXT_SPEED = 4;

const SPACE_FROM_JUSSEMENCE = 2;

const X_SCALE = 2;
const Y_SCALE = 2;
const Z_SCALE = 1;

const TEXT_BASELINE = "top";
const FONT = "20px NFPixels";
const FILL_STYLE = "black";
const LINE_SPACING = 20;

export class Bubble extends Actor {
    private _text: string;
    private _lines: string[];
    private _cursor_x: number;
    private _cursor_y: number;
    private _current_frame: number;

    private _canvas: HTMLCanvasElement;
    private _canvas_context: CanvasRenderingContext2D | null;

    private _texture: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>;
    private _sprite: THREE.Sprite<THREE.Object3DEventMap>; 

    private _text_texture: THREE.CanvasTexture<HTMLCanvasElement>;
    private _text_sprite: THREE.Sprite<THREE.Object3DEventMap>; 

    constructor(text: string, scene: THREE.Scene<THREE.Object3DEventMap>, texture_loader: THREE.TextureLoader) {
        super();

        this._text = text;

        this._texture = texture_loader.load(SPRITE_FILE_NAME);
        this._texture.colorSpace = THREE.SRGBColorSpace;
        this._texture.magFilter = THREE.NearestFilter;

        this._sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: this._texture,
            transparent: true,
            // 2D art: keep its colours untouched by the scene tone mapping
            toneMapped: false 
        }));

        this._sprite.scale.set(X_SCALE, Y_SCALE, Z_SCALE);
        this._sprite.position.set(SPACE_FROM_JUSSEMENCE, SPACE_FROM_JUSSEMENCE, 0);

        scene.add(this._sprite);
        
        this._canvas = document.createElement('canvas');
        this._canvas.width = 200;
        this._canvas.height = 200;

        this._canvas_context = this._canvas.getContext('2d');	

        if (!this._canvas_context) throw new Error();

        this._canvas_context.textBaseline = TEXT_BASELINE;
        this._canvas_context.font = FONT;
        this._canvas_context.fillStyle = FILL_STYLE;
        
        this._text_texture = new THREE.CanvasTexture(this._canvas);
        this._text_texture.magFilter = THREE.NearestFilter;
        
        this._text_sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this._text_texture,
            transparent: true,
            // 2D art: keep its colours untouched by the scene tone mapping
            toneMapped: false
        }));
        this._text_sprite.scale.set(X_SCALE, Y_SCALE, Z_SCALE);
        this._text_sprite.position.set(SPACE_FROM_JUSSEMENCE, SPACE_FROM_JUSSEMENCE, 0);
        scene.add(this._text_sprite);
        
        this._lines = [""];
        let current_line = 0;

        for (const s of this._text.split(" ")) {
            const current = this._lines[current_line];

            if (current.length + s.length > MAX_CHAR_PER_LINE) {
                this._lines.push(s);
                current_line++;
            } else {
                if (current !== "") {
                    this._lines[current_line] += " " + s;
                } else {
                    this._lines[current_line] += s;
                }
            }
        }

        this._cursor_x = 10;
        this._cursor_y = 20;
        this._current_frame = 0;
    }

    get position() {
        return this._sprite.position;
    }

    // this will be a nightmare to improve
    next_char(frame_context: FrameContext) {
        if (!this._canvas_context) throw new Error();

        if (!frame_context.bubble_displayed) {
            if (this._current_frame % TEXT_SPEED === 0) {
                this._canvas_context.clearRect(0, 0, this._canvas.width, this._canvas.height);
                let nb_chars = this._current_frame / TEXT_SPEED;
                this._cursor_y = LINE_SPACING;

                for (const l of this._lines) {
                    const to_write = l.length < nb_chars ? l.length : nb_chars;

                    this._canvas_context.fillText(l.substring(0, to_write), this._cursor_x, this._cursor_y);

                    nb_chars -= to_write;

                    if (nb_chars === 0) {
                        break;
                    }

                    this._cursor_y += LINE_SPACING;
                }
                
                this._text_texture.needsUpdate = true;
            }
            
            frame_context.bubble_displayed = this._current_frame / TEXT_SPEED === this._text.length;

            this._current_frame += 1;
	    }
    }

    update_position(frame_context: FrameContext) {
        this._sprite.position.set(
            frame_context.jussemence_position.x + Math.sin(frame_context.camera_rotation.y - Math.PI * 1.5) * SPACE_FROM_JUSSEMENCE,
            this._sprite.position.y,
            frame_context.jussemence_position.z + Math.cos(frame_context.camera_rotation.y - Math.PI * 1.5) * SPACE_FROM_JUSSEMENCE
        );

        this._text_sprite.position.set(
            frame_context.jussemence_position.x + Math.sin(frame_context.camera_rotation.y - Math.PI * 1.5) * SPACE_FROM_JUSSEMENCE,
            this._sprite.position.y,
            frame_context.jussemence_position.z + Math.cos(frame_context.camera_rotation.y - Math.PI * 1.5) * SPACE_FROM_JUSSEMENCE
        )
    }

    next_frame(frame_context: FrameContext) {
        this.update_position(frame_context);
        this.next_char(frame_context);
    }
}