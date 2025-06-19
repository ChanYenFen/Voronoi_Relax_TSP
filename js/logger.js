// --- Path Length Utilities + Logging ---

function pathLength(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += dist(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
  }
  return total;
}

function logPathLengths(pointCnt, original, nnSorted, optimized) {
  const lenRaw = pathLength(original).toFixed(2);
  const lenNN  = pathLength(nnSorted).toFixed(2);
  const lenOpt = pathLength(optimized).toFixed(2);

  // Remove existing div if not a p5.Element
  let display = select('#log-display');
  if (display && typeof display.html !== 'function') {
    display.remove();
    display = null;
  }

  // Create if not exist
  if (!display) {
    display = createDiv('').id('log-display');
    display.parent('canvas-wrapper');
    display.style('margin-top', '10px');
    display.style('font-family', 'monospace');
    display.style('font-size', '14px');
  }

  display.html(
    `⚫ Point Count: ${pointCnt}<br>` +
    `🔵 Raw (unordered): ${lenRaw}<br>` +
    `🟡 Nearest Neighbor: ${lenNN}<br>` +
    `🔴 Optimized: ${lenOpt}<br>` + 
    `⚪ Difference: ${(lenOpt/lenRaw).toFixed(3)}` + ' Shorter'
  );
}
