import * as PIXI from "pixi.js";

/**
 * Add mouse and touch events to a PIXI displayObject to enable dragging
 * @param obj The PIXI displayObject
 * @param cb  Callback to set the new x and y for the object
 */
function subscribeToMoveEvents(obj, cb) {
  obj.interactive = true;
  obj.cb = cb || (_ => {});
  obj
    .on("mousedown", onDragStart)
    .on("touchstart", onDragStart)
    .on("mouseup", onDragEnd)
    .on("mouseupoutside", onDragEnd)
    .on("touchend", onDragEnd)
    .on("touchendoutside", onDragEnd)
    .on("mousemove", onDragMove)
    .on("touchmove", onDragMove);

  function onDragStart(event) {
    if (!this.dragging) {
      event.stopPropagation();
      this.data = event.data;
      this.dragging = true;

      // Point relative to the center of the object
      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  function onDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.data = null;
    }
  }

  function onDragMove(event) {
    if (this.dragging) {
      event.stopPropagation();
      const newPosition = this.data.getLocalPosition(this.parent);
      newPosition.x = newPosition.x - this.dragPoint.x;
      newPosition.y = newPosition.y - this.dragPoint.y;
      this.cb(newPosition);
    }
  }
}

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
 */
function drawFormations(container, formations, bitProjection) {
  for (let f of formations) {
    f.points = f.data.map(point => [Number(point.vs), Number(point.tot)]);
  }
  for (let i = 0; i < formations.length - 1; i++) {
    let { points, bg_color: bgColor, bg_percent: bgPercent } = formations[i];
    const { points: nextPoints } = formations[i + 1];
    for (let j = 0; j < points.length - 1; j++) {
      //
      if (points[j][0] >= bitProjection.vs - 0.01) {
        bgPercent = 0.3;
      }
      // Draw a polygon with four points having the height of this layer
      const p = [...points[j], ...points[j + 1], ...nextPoints[j + 1], ...nextPoints[j]];
      drawFormationSegment(bgColor, bgPercent, p, container);
    }
  }
}

export { subscribeToMoveEvents, drawFormations };
