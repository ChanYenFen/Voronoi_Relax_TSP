// All of the points
let points = [];
let unrelaxedPoints = [];
let pointCnt = 1000;
let drawIndex = 0;

// Global variables for geometry
let delaunay, voronoi;

// Image
let gloria;

let relaxFrames = 300;
let showAnimation = false;
let tspCalculationStarted = false;
let tspCalculationDone = false;

let rawPath = [], nnSorted = [], optimizedPath = [];

function preload() {
  gloria = loadImage("data/sample.jpg");
}

function setup() {
  const canvas = createCanvas(500, 500);
  canvas.parent('canvas-wrapper');

  generateRandomPoints(pointCnt);
  unrelaxedPoints = points.map(p => p.copy());

  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);

  createButton('Save Points').parent("button-panel").mousePressed(() => {
    savePointsToJSON(points, 'my.json');
  });

  createButton('Log Length').parent("button-panel").mousePressed(() => {
    logPathLengths(pointCnt, rawPath, nnSorted, optimizedPath);
  });

  createButton('Upload Points to GitHub')
  .parent("button-panel")
  .mousePressed(() => {
    const json = JSON.stringify(points);
    uploadJSONToGitHub(json, 'points.json');
  });
  
}

function draw() {
  background(255);

  if (!tspCalculationStarted && relaxFrames === 0) {
    tspCalculationStarted = true;
    setTimeout(() => {
      rawPath = [...points];
      nnSorted = nearestNeighborPath([...points]);
      optimizedPath = twoOptWithRadiusAvoidCrossing([...nnSorted], 100, 100);
      optimizedPath = cleanCrossingsIterative(optimizedPath);

      // Remap optimizedPath to match reset point positions
      const newPoints = unrelaxedPoints.map(p => p.copy());
      optimizedPath = optimizedPath.map(p => {
        const idx = rawPath.findIndex(rp => rp.x === p.x && rp.y === p.y);
        return newPoints[idx];
      });
      points = newPoints;

      delaunay = calculateDelaunay(points);
      voronoi = delaunay.voronoi([0, 0, width, height]);

      tspCalculationDone = true;
      showAnimation = true;
      relaxFrames = 400;
      drawIndex = 0;
    }, 0);
  }

  if (relaxFrames > 0) {
    updatePoints();
    relaxFrames--;
  }

  if (showAnimation) {
    displayPoints();
    drawPolyline(points, color(0, 0, 0, 100), 0.2);
    if (optimizedPath.length > 0) drawTSPAnimated(optimizedPath);
  }
}

async function uploadJSONToGitHub(jsonData, filename) {
  const repo = 'ChanYenFen/Voronoi_Relax_TSP';
  const path = `data/${filename}`;
  const token = GITHUB_TOKEN;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  let sha = null;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (res.ok) {
      const fileData = await res.json();
      sha = fileData.sha;
    }
  } catch (e) {
    console.log("檔案不存在，將建立新檔案");
  }

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update JSON from p5.js',
      content: btoa(unescape(encodeURIComponent(jsonData))),
      sha: sha,
    }),
  });

  const result = await response.json();
  console.log(result);
  alert("Json uploaded！");
}
