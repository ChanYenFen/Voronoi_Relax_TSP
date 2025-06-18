// Display points
function displayPoints() {
  for (let v of points) {
    stroke(0, 0, 0, 200);
    strokeWeight(2);
    point(v.x, v.y);
  }
}

// Display polyline by list of points
function drawPolyline(path, c, w) {
  noFill();
  stroke(c);
  strokeWeight(w);
  beginShape();
  for (let p of path) {
    vertex(p.x, p.y);
  }
  endShape();
}

function drawTSPAnimated(path) {
  stroke(255, 0, 0, 200);
  strokeWeight(0.5);
  noFill();

  beginShape();
  for (let i = 0; i < drawIndex && i < path.length; i++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();

  if (drawIndex < path.length) drawIndex += 0.5; // 控制速度
}