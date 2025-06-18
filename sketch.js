// All of the points
let points = [];
let pointCnt = 1000;

let drawIndex = 0;
// Global variables for geometry
let delaunay, voronoi;

// Image
let gloria;

let relaxFrames = 200; // Let Voronoi relaxation run for 100 frames
let showInitialPath = false;
let showOptimizedPath = false;
let optimizedPath = [];
let optimizedCalculated = false;

// Log
let rawPath = [];
let nnSorted = [];

let readyToOptimize = false;
let triggerOptimize = false;


// Load image before setup
function preload() {
  gloria = loadImage("data/sample.jpg");
}

function setup() {
  createCanvas(500, 500);

  // Generate random points avoiding bright areas
  generateRandomPoints(pointCnt);

  // Calculate Delaunay triangulation and Voronoi diagram
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
  
  // Save points as s json file
  let saveBtn = createButton('💾 Save Points');
  saveBtn.position(10, height+10);
  saveBtn.mousePressed(() => {savePointsToJSON(points, 'my.json');
                             });
  
  let toggleInitialPath = createButton('🧵 Toggle Initial Path');
  toggleInitialPath.position(140, height + 10);
  toggleInitialPath.mousePressed(() => {
    showInitialPath = !showInitialPath;
  });
  
  let optimizeBtn = createButton('🧠 Optimize Path');
  optimizeBtn.position(300, height + 10);
  optimizeBtn.mousePressed(() => {
    triggerOptimize = true;
    if (optimizedCalculated) {
      showOptimizedPath = !showOptimizedPath;
    }
  });

  let logBtn = createButton('📏 Log Length');
  logBtn.position(450, height + 10);
  logBtn.mousePressed(() => {
    let rawLen = pathLength(rawPath);
    let nnLen = pathLength(nnSorted);
    let optLen = pathLength(optimizedPath);
    console.log("🔵 Raw:", rawLen.toFixed(2));
    console.log("🟡 Nearest Neighbor:", nnLen.toFixed(2));
    console.log("🔴 Optimized:", optLen.toFixed(2));
  });
  
}

function draw() {
  background(255);

  // Display points
  displayPoints();

  // Calculate centroids and update points
  if (relaxFrames > 0) {
    updatePoints();
    relaxFrames--;
    // Calculate TSP only when relax is done
    if (relaxFrames === 0) {
      readyToOptimize = true;
    }
  }
  
  if (triggerOptimize && readyToOptimize && !optimizedCalculated) {
    rawPath = [...points];
    nnSorted = nearestNeighborPath([...points]);
    optimizedPath = twoOptWithRadiusAvoidCrossing([...nnSorted], 100, 200);
    optimizedPath = cleanCrossingsIterative(optimizedPath);
    optimizedCalculated = true;
  }
  
  // if (showInitialPath) {
  //   drawPolyline(points, color(0, 0, 0, 100), 0.1);
  // }
  drawPolyline(points, color(0, 0, 0, 100), 0.2);

  if (showOptimizedPath && optimizedPath.length > 0) {
    // drawPolyline(optimizedPath, color(25, 0, 0, 150), 1);
    drawTSPAnimated(optimizedPath);
  }
  
}
