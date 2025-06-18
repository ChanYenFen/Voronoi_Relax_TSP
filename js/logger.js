// --- Path Length Utilities + Logging ---

function pathLength(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += dist(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
  }
  return total;
}

function logPathLengths(original, nnSorted, optimized) {
  const lenRaw = pathLength(original);
  const lenNN  = pathLength(nnSorted);
  const lenOpt = pathLength(optimized);

  console.log("🔵 Raw (unordered):", lenRaw.toFixed(2));
  console.log("🟡 Nearest Neighbor:", lenNN.toFixed(2));
  console.log("🔴 Optimized:", lenOpt.toFixed(2));
}
