function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

function calculateDip(tot, prevTot, vs, prevVs) {
  let newDip = -toDegrees(Math.atan((tot - prevTot) / (vs - prevVs)));
  return newDip < -180 ? newDip + 360 : newDip;
}

function getChangeInY(dip, vs, prevVs) {
  return -Math.tan(-dip / 57.29578) * Math.abs(vs - prevVs);
}

export { calculateDip, toDegrees, toRadians, getChangeInY };
