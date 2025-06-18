// Generate random points avoiding bright areas
function generateRandomPoints(n) {
  points.push(createVector(0, 0));
  for (let i = 0; i < n; i++) {
    let x = random(width);
    let y = random(height);
    let col = gloria.get(x, y);
    if (random(100) > brightness(col)) {
      points.push(createVector(x, y));
    } else {
      i--;
    }
  }
}