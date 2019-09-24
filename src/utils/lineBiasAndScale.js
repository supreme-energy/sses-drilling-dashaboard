export function computeLineBiasAndScale(bias, scale, extent) {
  const [xMin] = extent;

  const x = bias + xMin - xMin * scale;
  const pixiScale = { y: 1, x: scale || 1 };
  return [x, pixiScale];
}
