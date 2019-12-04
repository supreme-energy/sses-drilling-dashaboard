export function computeLineBiasAndScale(bias, scale, extent) {
  const [xMin] = extent;

  const x = bias;
  const pixiScale = { y: 1, x: scale || 1 };
  return [x, pixiScale];
}
