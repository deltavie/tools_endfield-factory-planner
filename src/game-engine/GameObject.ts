import { Engine } from "./Engine";
import type { Vec3 } from "./interfaces";

interface Transform{
    Position: Vec3;
}

export class GameObject {
    Transform: Transform = { // True transform to world space coordinates.
        Position: {
            x: 0,
            y: 0,
            z: 0
        }
    }
    RelativeTransform: Transform = { // Transform relative to the current main camera.
        Position: {
            x: 0,
            y: 0,
            z: 0
        }
    }
    // Called by the engine when created in the scene.
    Create(){}
    // Called by the engine when destroyed in the scene.
    Destroy(){}
    // Called by the engine everytime clock is called.
    Update(){
    }
    // Called by the engine everytime render is called.
    // Relative transform is passed by the engine giving this objects transform relative to the main camera.
    Render(){}
}