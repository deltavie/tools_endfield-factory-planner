import { Engine } from "../game-engine/Engine";
import type { ProductChainNode } from "./ProductChainNode";

export class ProductChain {
    Nodes: ProductChainNode[] = [];
    StartNode: ProductChainNode|null = null;
    // Function to delete chain.
    DeleteChain(){
        for(let key in this.Nodes){
            Engine.Destroy(this.Nodes[key]);
        }
        this.Nodes = [];
        this.StartNode = null;
    }
    // Visualize chain.
    VisualizeChain(){
        for(let key in this.Nodes){
            Engine.Instantiate(this.Nodes[key]);
        }
    }
}