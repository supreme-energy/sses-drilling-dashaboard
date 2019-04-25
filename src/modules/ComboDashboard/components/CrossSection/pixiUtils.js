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

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 * @param formations The formation data from the API
 */
function addDemoFormations(container, formations) {
  const calcXY = p => [Number(p.vs), Number(p.tot) + Number(p.thickness)];
  for (let f of formations) {
    f.xyCoords = f.data.map(point => calcXY(point));
  }
  for (let i = 0; i < formations.length - 1; i++) {
    const { xyCoords, bg_color: bgColor, bg_percent: bgPercent } = formations[i];
    let line = new PIXI.Graphics();
    let poly = new PIXI.Graphics();
    poly.lineStyle(0);
    line.lineStyle(4, Number(`0x${bgColor}`), 1);
    line.moveTo(...xyCoords[0]);
    for (let i = 1; i < xyCoords.length; i++) {
      line.lineTo(...xyCoords[i]);
    }
    container.addChild(line);
    poly.beginFill(Number(`0x${bgColor}`), Number(bgPercent));
    poly.drawPolygon(
      xyCoords
        .reverse()
        .flat()
        .concat(formations[i + 1].xyCoords)
        .flat()
    );
    poly.closePath();
    container.addChild(poly);
  }
}

export { subscribeToMoveEvents, addDemoFormations };
