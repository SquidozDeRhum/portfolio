export interface Keys {
	z: boolean;
	q: boolean;
	s: boolean;
	d: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
    Enter: boolean;
    ' ': boolean;
    n: boolean;
    r: boolean;
};

export class KeyboardHandler {
    private _keys: Keys;
    private _keys_pressed_last_frame: Keys;
    
    constructor() {
        this._keys = {
            z: false,
            q: false,
            s: false,
            d: false,
            ArrowLeft: false,
            ArrowRight: false,
            Enter: false,
            " ": false,
            n: false,
            r: false
        };

        this._keys_pressed_last_frame = {
            z: false,
            q: false,
            s: false,
            d: false,
            ArrowLeft: false,
            ArrowRight: false,
            Enter: false,
            " ": false,
            n: false,
            r: false
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

    get keys() {
        return this._keys;
    }

    get keys_pressed_last_frame() {
        return this._keys_pressed_last_frame;
    }

    save_frame_keys() {
        this._keys_pressed_last_frame = {
            z: this._keys.z,
            q: this._keys.q,
            s: this._keys.s,
            d: this._keys.d,
            ArrowLeft: this._keys.ArrowLeft,
            ArrowRight: this._keys.ArrowRight,
            Enter: this._keys.Enter,
            " ": this._keys[" "],
            n: this._keys.n,
            r: this._keys.r
        }
    }
}