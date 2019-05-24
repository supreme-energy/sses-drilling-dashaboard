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
    // TODO: Handle updated formation data (for instance adjusting a projection point)
    for (let i = 0; i < formations.length - 1; i++) {
      let { bg_color: bgColor, bg_percent: bgPercent } = formations[i];
      for (let j = 0; j < formations[i].data.length - 1; j++) {
        if (formations[i].data[j].vs >= lastSurvey.vs - 0.01) {
          bgPercent = 0.3;
        }
        let p1 = formations[i].data[j];
        let p2 = formations[i].data[j + 1];
        let p3 = formations[i + 1].data[j + 1];
        let p4 = formations[i + 1].data[j];

        // Draw a polygon with four points having the height of this layer
        // The right side points determine the fault applied on drawing
        const a1 = [p1.vs, p1.tot + p2.fault];
        const a2 = [p2.vs, p2.tot];
        const a3 = [p3.vs, p3.tot];
        const a4 = [p4.vs, p4.tot + p3.fault];
        const p = [...a1, ...a2, ...a3, ...a4];
        drawFormationSegment(bgColor, bgPercent, p, container);
      }
    }
  }
}
