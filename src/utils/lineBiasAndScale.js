export function computeLineBiasAndScale(bias, scale, extent) {
  const [xMin, xMax] = extent;
  const width = xMax - xMin;
  const computedWidth = width * scale;
  const x = bias + xMin - xMin * scale + (width - computedWidth) / 2;
  const pixiScale = { y: 1, x: scale || 1 };
  return [x, pixiScale];
}
