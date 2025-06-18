// savePoints.js - Utility to save points to JSON

function savePointsToJSON(pointsArray, filename = 'points.json') {
  const jsonData = pointsArray.map(p => ({ x: p.x, y: -p.y + height }));
  saveJSON(jsonData, filename);
}
