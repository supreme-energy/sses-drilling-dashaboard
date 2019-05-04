import * as PIXI from "pixi.js";

function drawFormationSegment(color, alpha, points, container) {
  const p = new PIXI.Graphics();
  p.lineStyle(0).beginFill(Number(`0x${color}`), Number(alpha));
  p.drawPolygon(points);
  p.closePath();
  container.addChild(p);
}

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 * @param formations The formation data from the API
 * @param lastSurvey The most recent survey point (not the bit projection)
 */
export function drawFormations(container, formations, lastSurvey) {
  let prevDataLength = 0;

  return update;

  function update(formations, lastSurvey) {
    if (!formations.length || !lastSurvey || prevDataLength === formations.length) return;
    prevDataLength = formations.length;
    // TODO: Handle new formation data and remove unnecessary calculations
    for (let f of formations) {
      f.points = f.data.map(point => [Number(point.vs), Number(point.tot)]);
    }
    for (let i = 0; i < formations.length - 1; i++) {
      let { points, bg_color: bgColor, bg_percent: bgPercent } = formations[i];
      const { points: nextPoints } = formations[i + 1];
      for (let j = 0; j < points.length - 1; j++) {
        //
        if (points[j][0] >= lastSurvey.vs - 0.01) {
          bgPercent = 0.3;
        }
        // Draw a polygon with four points having the height of this layer
        const p = [...points[j], ...points[j + 1], ...nextPoints[j + 1], ...nextPoints[j]];
        drawFormationSegment(bgColor, bgPercent, p, container);
      }
    }
  }
}
