import { Engine } from "../game-engine/Engine";
import { GameObject } from "../game-engine/GameObject";

export class ProductChainNode extends GameObject {
    // Connections.
    ParentNodes: ProductChainNode[] = [];
    ChildNodes: ProductChainNode[] = [];
    // Node properties.
    ProductName: string = "";
    ProductQuantity: number = 0;
    CraftingStation: string | null = ""
    // Visualization properties.
    Depth: number = 0; // How far down the chain to display this node.
    Width: number = 0; // How far down the width of the chain to display this node.
    // Create this node set initial position based on Depth and Width.
    Create(): void {
        this.Transform.Position.x = 300*this.Depth;
        this.Transform.Position.y = 175*this.Width;
    }
    // Update the connection lines between this node and its parents and children.
    Update(): void {
        
    }
    // Rendering the stats of this node at the position.
    Render(): void{
        if(!Engine.CanvasContext2D) return;
        var ctx = Engine.CanvasContext2D;
        ctx.fillStyle = `rgb(37, 37, 42)`;
        ctx.fillRect(this.RelativeTransform.Position.x-5, this.RelativeTransform.Position.y-25, 250,100);
        ctx.font = "18px Helvetica";
        ctx.fillStyle = `rgb(255,255,255)`;
        ctx.fillText(this.ProductName, this.RelativeTransform.Position.x, this.RelativeTransform.Position.y, 250);
        ctx.fillText(`${this.ProductQuantity.toString()}/min`, this.RelativeTransform.Position.x, this.RelativeTransform.Position.y+25, 250);
        if(this.CraftingStation) ctx.fillText(this.CraftingStation, this.RelativeTransform.Position.x, this.RelativeTransform.Position.y+50, 250);
    }
}