// --- Nearest Neighbor Heuristic ---
function nearestNeighborPath(points) {
  let path = [];
  let visited = new Array(points.length).fill(false);
  let current = points[0];
  path.push(current);
  visited[0] = true;

  for (let i = 1; i < points.length; i++) {
    let minDist = Infinity;
    let nearestIdx = -1;
    for (let j = 0; j < points.length; j++) {
      if (!visited[j]) {
        let d = dist(current.x, current.y, points[j].x, points[j].y);
        if (d < minDist) {
          minDist = d;
          nearestIdx = j;
        }
      }
    }
    current = points[nearestIdx];
    path.push(current);
    visited[nearestIdx] = true;
  }
  return path;
}

// --- Compute total path length ---
function pathLength(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += dist(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
  }
  return total;
}

// --- Refined 2-opt with Radius, Segment Cross Check, and Quadtree Refresh ---
function twoOptWithRadiusAvoidCrossing(path, maxIter = 2, radius = 10) {
  path = nearestNeighborPath(path); // ensure nearest neighbor pre-optimization

  // console.log("Initial path length:", pathLength(path).toFixed(2));

  let iter = 0;
  let improved = true;

  while (improved && iter < maxIter) {
    improved = false;
    let swapCount = 0;

    let midpoints = [];
    for (let i = 0; i < path.length - 1; i++) {
      let a = path[i];
      let b = path[i + 1];
      midpoints.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, i });
    }

    let qt = d3.quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(midpoints);

    for (let i = 1; i < path.length - 3; i++) {
      let a = path[i - 1];
      let b = path[i];

      qt.visit((node, x0, y0, x1, y1) => {
        if (!node.length && node.data) {
          let dx = node.data.x - a.x;
          let dy = node.data.y - a.y;
          if (dx * dx + dy * dy < radius * radius) {
            let j = node.data.i;
            if (j <= i + 1 || j >= path.length - 2) return false;

            let c = path[j];
            let d = path[j + 1];

            let currentDist = dist(a.x, a.y, b.x, b.y) + dist(c.x, c.y, d.x, d.y);
            let newDist = dist(a.x, a.y, c.x, c.y) + dist(b.x, b.y, d.x, d.y);

            if (segmentsCross(a, b, c, d) || newDist < currentDist) {
              let reversed = path.slice(i, j + 1).reverse();
              path.splice(i, j - i + 1, ...reversed);
              improved = true;
              swapCount++;
            }
          }
        }
        return false;
      });
    }
    iter++;
  }

  // console.log("Optimized path length:", pathLength(path).toFixed(2));
  return path;
}

// --- Helper: Check if two segments cross ---
function segmentsCross(a, b, c, d) {
  function ccw(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

// --- Post-pass cleaner to remove residual crossings ---
function cleanCrossings(path) {
  for (let i = 0; i < path.length - 3; i++) {
    for (let j = i + 2; j < path.length - 1; j++) {
      let a = path[i];
      let b = path[i + 1];
      let c = path[j];
      let d = path[j + 1];

      if (segmentsCross(a, b, c, d)) {
        let reversed = path.slice(i + 1, j + 1).reverse();
        path.splice(i + 1, j - i, ...reversed);
      }
    }
  }
  return path;
}

function cleanCrossingsIterative(path, maxIter = 10) {
  let changed = true;
  let iter = 0;
  while (changed && iter < maxIter) {
    changed = false;
    for (let i = 0; i < path.length - 3; i++) {
      for (let j = i + 2; j < path.length - 1; j++) {
        if (segmentsCross(path[i], path[i + 1], path[j], path[j + 1])) {
          let reversed = path.slice(i + 1, j + 1).reverse();
          path.splice(i + 1, j - i, ...reversed);
          changed = true;
        }
      }
    }
    iter++;
  }
  return path;
}