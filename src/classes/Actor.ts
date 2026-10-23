import type { FrameContext } from "../interfaces";

export abstract class Actor {
    abstract next_frame(frame_context: FrameContext): void;
}