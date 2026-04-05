import { Camera } from "./Camera";
import { GameObject } from "./GameObject";

class EngineObject {
    MainCamera: Camera = new Camera(); // Camera that is currently set as the main camera of the engine which the game will be rendered through.
    GameObjects: GameObject[] = [];

    // Rendering contexts.
    CanvasContext2D: CanvasRenderingContext2D|null = null;
    CanvasWidth: number = 0;
    CanvasHeight: number = 0;

    // Initialize engine for 2DHtmlCanvas
    Initialize2DHtmlCanvas(htmlCanvas: HTMLCanvasElement){
        this.CanvasContext2D =  htmlCanvas.getContext("2d");
        this.CanvasWidth =  htmlCanvas.width;
        this.CanvasHeight = htmlCanvas.height;
    }

    // Create objects.
    CreateList: GameObject[] = []; // same reason as destroy.
    Instantiate(gameObject: GameObject){
        if(this.CreateList.findIndex((obj) => obj == gameObject) >= 0) return;
        this.CreateList.push(gameObject);
    }

    // Delete objects.
    DestroyList: GameObject[] = []; // Need to do this step before updating to prevent changing Gameobjects list while looping.
    Destroy(gameObject: GameObject){
        if(this.DestroyList.findIndex((obj) => obj == gameObject) >= 0) return;
        this.DestroyList.push(gameObject);
    }
    
    // Logic update.
    Clock(){
        // Destroy objects.
        for(let objKey in this.DestroyList){
            var index = this.GameObjects.findIndex((obj) => obj === this.DestroyList[objKey]);
            if(index >= 0) this.GameObjects.splice(index, 1);
            this.DestroyList[objKey].Destroy();
        }
        this.DestroyList = [];
        // Create objects.
        for(let objKey in this.CreateList){
            this.GameObjects.push(this.CreateList[objKey]);
            this.CreateList[objKey].Create();
        }
        this.CreateList = [];
        // Update objects.
        for(let objKey in this.GameObjects){
            this.GameObjects[objKey].Update();
        }
    }
    // Render update.
    Render(){
        if(this.CanvasContext2D) this.CanvasContext2D.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
        // Sort objects by z;
        this.GameObjects.sort((a,b) => a.Transform.Position.z-b.Transform.Position.z);
        // Render objects.
        for(let objKey in this.GameObjects){
            var obj = this.GameObjects[objKey];
            obj.RelativeTransform = {
                Position: {
                    x: this.MainCamera.Transform.Position.x - obj.Transform.Position.x + this.CanvasWidth/2,
                    y: this.MainCamera.Transform.Position.y - obj.Transform.Position.y + this.CanvasHeight/2,
                    z: this.MainCamera.Transform.Position.z - obj.Transform.Position.z,
                }
            }
            obj.Render();
        }
    }
}

export const Engine: EngineObject = new EngineObject();