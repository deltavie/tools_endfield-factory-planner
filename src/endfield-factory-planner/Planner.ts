import { Formula, type Ingredient } from "./Formula";
import type { Product } from "./Product";
import { ProductChain } from "./ProductChain";
import { ProductChainNode } from "./ProductChainNode";

import productsJson from './aic-products/products.json';

// Function to import files from require.context
function importAll(r: Rspack.Context) {
    let files = {};
    //@ts-ignore mapping strings should not be a problem
    r.keys().map(item => { files[item.replace('./', '')] = r(item); });
    return files;
}

export class Planner {
    // Products dictionary.
    Products: {[key: string]: Product} = {};

    // Create new planner and load products and formulas.
    constructor(){
        this.LoadProducts(productsJson);
    }

    // Rebuild the products dictionary.
    // Check ./aic-products/products.json for how the products object should be formatted.
    LoadProducts(products: object): boolean{
        this.Products = {}; // Clear products dictionary to rebuild it.
        var FormulasAdded: number = 0;
        for(let productKey in products){
            var product = (products as any)[productKey];
            this.Products[productKey] = { // craete new product entry.
                Formulas: []
            };
            if('Formulas' in product){ //Add formulas or report malformed json property.
                for(let formulaKey in product['Formulas']){
                    var addFormula = AddJSONFormula(this, productKey, product['Formulas'][formulaKey]);
                    if(addFormula){
                        FormulasAdded++;
                    }else{
                        Error(`${productKey} Formulas property is malformed!`);
                    }
                }
            }else{
                Error(`${productKey} is missing Formulas property!`);
            }
        }
        console.log(`Loaded ${Object.keys(this.Products).length} products and ${FormulasAdded} formulas.`);
        return true;
    }

    CurrentProductChain: ProductChain = new ProductChain(); // Chain for current product selected.
    // Exposed function to provide functionality to app.
    BuildProductChain(product: string, countPerMinute: number){
        this.CurrentProductChain.DeleteChain(); // Clean up old chain.
        this._DepthTable = {}; // Clean up depth table.
        this.CurrentProductChain.StartNode = this.GenerateProductChain(product, countPerMinute);
        this.CurrentProductChain.VisualizeChain();
        console.log(this.CurrentProductChain.StartNode);
    }

    private _DepthTable: {[key: number]: number} = {} // Keep track of how many products are at each depth.
    // Function to generate chain of products needed to create product.
    // Return: The node representing the start of the chain.
    // productKey: product name in list of products.
    // counterPerMinute: how many of this product is needed.
    // depth(optional): how deep in the chain this product is.
    // parentNodes(optional): what are the parent nodes of this product.
    private GenerateProductChain(productKey: string, countPerMinute: number, depth: number = 0, parentNodes: ProductChainNode[]|null = null): ProductChainNode|null{
        var product = this.Products[productKey]; // Get the current product.
        if(product == null){ // No product found.
            Error(`${productKey} Error in product chain!`);
            return null;
        }
        // Create a node that is the current product.
        var NewNode: ProductChainNode = new ProductChainNode();
        NewNode.ProductName = productKey;
        NewNode.ProductQuantity = countPerMinute;
        if(parentNodes != null) NewNode.ParentNodes = parentNodes as ProductChainNode[];// Set the parent of this node.
        // Set the depth and width of this node based on the depth table.
        if(this._DepthTable[depth] == null) this._DepthTable[depth] = 0; // Set depth table width to 0 if first product at this depth.
        NewNode.Depth = depth;
        NewNode.Width = this._DepthTable[depth]; // Increase width at this depth by 1.
        this._DepthTable[depth]++;
        // Finally add node to list of all nodes.
        this.CurrentProductChain.Nodes.push(NewNode);
        // Create the next part of the chain by loop through the ingredients and outputs of the current product.
        if(product.Formulas.length > 0){
            var formula = product.Formulas[0]; // We will only use the first formula for now.
            for(let ingredientsKey in formula.Ingredients){ // For each ingredient calculate how many we need.
                var ingredient = formula.Ingredients[ingredientsKey];
                var ingredientsNeeded = countPerMinute*ingredient.count;
                var childNode = this.GenerateProductChain(ingredient.name, ingredientsNeeded, depth+1, [NewNode]); // Ingredient is at depth+1.
                if(childNode != null){
                    childNode.CraftingStation = formula.Crafting as string; // Set crafting station
                    NewNode.ChildNodes.push(childNode);
                }
            }
            for(let outputKey in formula.Outputs){ // Calculate if there are other outputs created when making this product to show on the chain.
                var output = formula.Outputs[outputKey];
                if(output.name == productKey) continue; // Ignore if output product is the current node.
                // We don't care about generating the product chain of an output so we just create a new node at depth-1.
                var OutputNode: ProductChainNode = new ProductChainNode();
                OutputNode.ProductName = output.name;
                OutputNode.ProductQuantity = output.count*countPerMinute;
                OutputNode.Depth = depth-1; // Calculate depth and width of new created output node.
                OutputNode.Width = this._DepthTable[depth-1];
                this._DepthTable[depth-1]++;
                this.CurrentProductChain.Nodes.push(OutputNode); // Add output node to all nodes.
                OutputNode.ChildNodes.push(NewNode); // Add current node to output node's children.
                NewNode.ParentNodes.push(OutputNode); // Add output node to current node's parent.
            }
        }
        return NewNode; // Return the created node.
    }
    
}

// Helper for load products to add a formula to the product. Mainly for readability.
function AddJSONFormula(planner: Planner, productKey: string, formula: object): boolean {
    var toAddFormula: Formula = { // formula to load into our dictionary.
        Ingredients: [],
        Crafting: null,
        CraftingTime: 0,
        Outputs: []
    }
    // Ingredients property.
    if ("Ingredients" in formula && formula["Ingredients"] instanceof Array) {
        var ingredients = (formula as any)["Ingredients"];
        for (let ingredientKey in ingredients) {
            var ingredient = ingredients[ingredientKey];
            var newIngredient: Ingredient | false = ParseIngredientJSON(ingredient);
            if (!newIngredient) {
                Error(`${productKey} Ingredients is malformed!`);
                return false;
            }
            toAddFormula.Ingredients.push(newIngredient); // Add new ingredient.
        }
    } else {
        Error(`${productKey} Ingredients property is malformed!`);
        return false;
    }
    // Check crafting property.
    if ("Crafting" in formula && typeof formula["Crafting"] === 'string') {
        toAddFormula.Crafting = formula["Crafting"];
    } else {
        Error(`${productKey} Crafting property is malformed!`);
        return false;
    }
    // Crafting time property.
    if ("CraftingTime" in formula && typeof formula["CraftingTime"] === 'number') {
        toAddFormula.CraftingTime = formula["CraftingTime"];
    } else {
        Error(`${productKey} CraftingTime property is malformed!`);
        return false;
    }
    // Outputs property.
    if ("Outputs" in formula && formula["Outputs"] instanceof Array) {
        var outputs = (formula as any)["Outputs"];
        for (let outputKey in outputs) {
            var output = outputs[outputKey];
            var newOutput: Ingredient | false = ParseIngredientJSON(output);
            if (!newOutput) {
                Error(`${productKey} Outputs is malformed!`);
                return false;
            }
            toAddFormula.Outputs.push(newOutput);
        }
    } else {
        Error(`${productKey} Outputs property is malformed!`);
        return false;
    }
    // Add key to product dictionary.
    planner.Products[productKey].Formulas.push(toAddFormula);
    return true;
}

// Return false if failed to parse ingredient.
function ParseIngredientJSON(ingredient: object): Ingredient | false{
    var newIngredient: Ingredient = {
        name: "",
        count: 0
    }
    if ("name" in ingredient && typeof ingredient["name"] === 'string') { // Copy ingredient properties over.
        newIngredient.name = ingredient["name"];
    }else{
        return false
    }
    if ("count" in ingredient && typeof ingredient["count"] === 'number') {
        newIngredient.count = ingredient["count"];
    }else{
        return false;
    }
    return newIngredient;
}

// Helper function for errors.
function Error(message: string){
    console.log(message); // Need this function for later.
}