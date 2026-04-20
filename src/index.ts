import { Planner } from './endfield-factory-planner/Planner';
import { PlannerCamera } from './endfield-factory-planner/ui-and-control/PlannerCamera';
import { Engine } from './game-engine/Engine';
import { MouseButtons } from './game-engine/Mouse';
import './index.css';

// Create factory planner object.
const planner: Planner = new Planner();
planner.BuildProductChain("HC Valley Battery", 6);

// Create app page.
const rootEl = document.querySelector('#root');
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">
    <h1>Endfield Simple AIC Planner</h1>
    <p>Updated to Game Patch: 1.2</p>
    <div class="search">
      <input type="search" id="product-search" name="product-search-bar" placeholder="Enter product name..."/>
      <input type="number" id="product-quantity" name="quantity" min="0" max="999999" step="0.1" value="1" required />
      <span>/min</span>
      <button id="product-search-button">Search</button>
      <div class="product-search-dropdown" id="dropdown-container">
      </div>
    </div>
    <canvas id="output-canvas" width="1280px" height="720px"></canvas>
  </div>
`;

  // Create search bar.
  const searchBtn = rootEl.querySelector("#product-search-button");
  const searchBar = rootEl.querySelector("#product-search");
  const quantityBar = rootEl.querySelector("#product-quantity");

  if (searchBtn && searchBar && quantityBar) { // Search button.
    searchBtn.addEventListener("click", () => {
      //@ts-ignore
      planner.BuildProductChain(searchBar.value, Number(quantityBar.value))
    });
  }

  const dropDown = rootEl.querySelector("#dropdown-container");

  // Auto complete.
  if (searchBar && dropDown) {
    searchBar.addEventListener("input", () => {
      dropDown.innerHTML = ''; // Clear previous lists.
      //@ts-ignore search bar value
      var searchBarValue = searchBar.value;
      if (searchBarValue.length <= 0) return; // Do not show results when empty.
      for (let key in planner.Products) {
        if (key.substring(0, searchBarValue.length).toUpperCase() == searchBarValue.toUpperCase()) { // Only show matching results.
          var productDiv = document.createElement("DIV");
          productDiv.innerHTML = key;
          productDiv.addEventListener("click", () => { // When clicked change value and close list.
            var myValue = key;
            //@ts-ignore search bar value
            searchBar.value = myValue;
            dropDown.innerHTML = '';
          })
          dropDown.appendChild(productDiv);
        }
      }
    })
  }

  // Initialize engine for HTML canvas.
  // Add mouse listener events.
  const canvas2D = rootEl.querySelector("#output-canvas");
  if(canvas2D){
    var canvas = (canvas2D as HTMLCanvasElement);
    Engine.Initialize2DHtmlCanvas(canvas);
    canvas.addEventListener("mousemove", (event) => {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      Engine.UpdateMousePosition(
        (event.clientX - rect.left) * scaleX,
        (event.clientY - rect.top) * scaleY
      )
    })
    canvas.addEventListener("mousedown", (event) => {
      var button = event.button;
      switch(button){
        case 0:
          Engine.UpdateMouseState(MouseButtons.MOUSE1, true);
          break;
        case 1:
          Engine.UpdateMouseState(MouseButtons.MOUSE2, true);
          break;
      }
    })
    canvas.addEventListener("mouseup", (event) => {
      var button = event.button;
      switch(button){
        case 0:
          Engine.UpdateMouseState(MouseButtons.MOUSE1, false);
          break;
        case 1:
          Engine.UpdateMouseState(MouseButtons.MOUSE2, false);
          break;
      }
    })
  }
}

// Setup the engine properities.
const UICamera = new PlannerCamera();
Engine.MainCamera = UICamera;
Engine.Instantiate(UICamera);
// Start engine render loop.
var EngineRenderTimerId: number = 0;
const nextFrame = (timestamp: DOMHighResTimeStamp) => {
  Engine.Clock();
  Engine.Render();
  EngineRenderTimerId = requestAnimationFrame(nextFrame);
}
EngineRenderTimerId = requestAnimationFrame(nextFrame);
// Start engine logic loop.
// var EngineLogicInterval = setInterval(function() {
//   Engine.Clock();
//   Engine.Render();
// }, 500);