import { Planner } from './endfield-factory-planner/Planner';
import { Engine } from './game-engine/Engine';
import './index.css';

// Create factory planner object.
const planner: Planner = new Planner();
planner.BuildProductChain("HC Valley Battery", 6);

// Create app page.
const rootEl = document.querySelector('#root');
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">
    <h1>Endfield Factory Planner</h1>
    <p>Latest Game Patch: 1.1</p>
    <div class="search">
      <input type="search" id="product-search" name="product-search-bar" placeholder="Enter product name..."/>
      <input type="number" id="product-quantity" name="quantity" min="0" max="999999" step="0.1" value="1" required />
      <span>/min</span>
      <button id="product-search-button">Search</button>
      <div class="product-search-dropdown" id="dropdown-container">
      </div>
    </div>
    <div class="canvas">
          <canvas id="output-canvas" width="1280px" height="720px"></canvas>
    </div>   
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
  const canvas2D = rootEl.querySelector("#output-canvas");
  if(canvas2D){
    Engine.Initialize2DHtmlCanvas(canvas2D as HTMLCanvasElement);
  }
}

// Start engine render loop.
var EngineRenderTimerId: number = 0;
const nextFrame = (timestamp: DOMHighResTimeStamp) => {
  Engine.Render();
  EngineRenderTimerId = requestAnimationFrame(nextFrame);
}
//EngineRenderTimerId = requestAnimationFrame(nextFrame);
// Start engine logic loop.
var EngineLogicInterval = setInterval(function() {
  Engine.Clock();
  Engine.Render();
}, 500);