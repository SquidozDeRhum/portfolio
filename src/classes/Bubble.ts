import * as THREE from 'three';

const SPRITE_FILE_NAME = "bubble.png";
const MAX_CHAR_PER_LINE = 18;
const TEXT_SPEED = 4;

const TEXT_BASELINE = "top";
const FONT = "20px NFPixels";
const FILL_STYLE = "black";

export class Bubble {
    private _text: string;
    private _lines: string[];
    private _displayed: boolean;
    private _x: number;
    private _y: number;
    private _i: number;

    private _canvas: HTMLCanvasElement;
    private _canvas_context: CanvasRenderingContext2D | null;

    private _texture: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>;
    private _sprite: THREE.Sprite<THREE.Object3DEventMap>; 

    private _text_texture: THREE.CanvasTexture<HTMLCanvasElement>;
    private _text_sprite: THREE.Sprite<THREE.Object3DEventMap>; 

    constructor(text: string, scene: THREE.Scene<THREE.Object3DEventMap>, texture_loader: THREE.TextureLoader) {
        this._text = text;

        this._texture = texture_loader.load(SPRITE_FILE_NAME);
        this._texture.colorSpace = THREE.SRGBColorSpace;
        this._texture.magFilter = THREE.NearestFilter;

        this._sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: this._texture,
            transparent: true 
        }));

        this._sprite.scale.set(2, 2, 1);
        this._sprite.position.set(2, 1.5, 0.1);

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
            transparent: true
        }));
        this._text_sprite.scale.set(2, 2, 1);
        this._text_sprite.position.set(2, 1.5, 0.1);
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

        this._displayed = false;
        this._x = 10;
        this._y = 20;
        this._i = 0;
    }

    get displayed() {
        return this._displayed; 
    }

    nextChar() {
        if (!this._canvas_context) throw new Error();

        if (!this._displayed) {
            if (this._i % TEXT_SPEED === 0) {
                this._canvas_context.clearRect(0, 0, this._canvas.width, this._canvas.height);
                let nb_chars = this._i / TEXT_SPEED;
                this._y = 20;

                for (const l of this._lines) {
                    const to_write = l.length < nb_chars ? l.length : nb_chars;

                    this._canvas_context.fillText(l.substring(0, to_write), this._x, this._y);

                    nb_chars -= to_write;

                    if (nb_chars === 0) {
                        break;
                    }

                    this._y += 20;
                }
                
                this._text_texture.needsUpdate = true;
            }
            
            this._displayed = this._i / TEXT_SPEED === this._text.length;
            this._i += 1;
	    }
    }
}