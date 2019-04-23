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
function addDemoFormations(container, formations) {
  const calcXY = p => [Number(p.vs), Number(p.tot) + Number(p.thickness)];
  for (let f of formations) {
    f.points = f.data.map(point => calcXY(point));
  }
  for (let i = 0; i < formations.length - 1; i++) {
    const { points, bg_color: bgColor, bg_percent: bgPercent } = formations[i];
    const { points: nextPoints } = formations[i + 1];
    for (let j = 0; j < points.length - 1; j++) {
      // Draw a polygon with four points having the height of this layer
      const p = [...points[j], ...points[j + 1], ...nextPoints[j + 1], ...nextPoints[j]];
      drawFormationSegment(bgColor, bgPercent, p, container);
    }
  }
}

function drawProjections(container, formations, projections) {
  const lastFormationPoints = formations.map(f => f.data[f.data.length - 1]);

  // -------------------------------------- Trace formations
  const wpData = projections.map(x => [Number(x.vs), Number(x.tvd)]);
  const projectedPath = new PIXI.Graphics();
  projectedPath.lineStyle(3, 0xee3322, 1);
  projectedPath.moveTo(...wpData[0]);
  for (let i = 1; i < wpData.length; i++) {
    projectedPath.lineTo(...wpData[i]);
  }
  container.addChild(projectedPath);

  const red = 0xee2211;
  const white = 0xffffff;
  const left = {
    vs: 5908,
    tcl: 13328,
    tot: 13270,
    bot: 13386
  };
  const right = {
    vs: 6100,
    tot: 13290,
    tcl: 13348,
    bot: 13406
  };
  // -------------------------------------- Line segments
  const totLine = new PIXI.Graphics();
  totLine.lineStyle(2, red, 1);
  totLine.moveTo(left.vs, left.tot).lineTo(right.vs, right.tot);
  container.addChild(totLine);

  const tclLine = new PIXI.Graphics();
  tclLine.lineStyle(2, red, 1);
  tclLine.moveTo(left.vs, left.tcl).lineTo(right.vs, right.tcl);
  container.addChild(tclLine);

  const botLine = new PIXI.Graphics();
  botLine.lineStyle(2, red, 1);
  botLine.moveTo(left.vs, left.bot).lineTo(right.vs, right.bot);
  container.addChild(botLine);

  // -------------------------------------- Left nodes
  const totCircle = new PIXI.Graphics();
  totCircle.lineStyle(2, red).beginFill(red, 0.4);
  totCircle.drawCircle(left.vs, left.tot, 10);
  totCircle.endFill();
  container.addChild(totCircle);
  const botCircle = new PIXI.Graphics();
  botCircle.lineStyle(2, red).beginFill(red, 0.4);
  botCircle.drawCircle(left.vs, left.bot, 10);
  botCircle.endFill();
  container.addChild(botCircle);
  const faultBox = new PIXI.Graphics();
  faultBox.lineStyle(2, red);
  faultBox.beginFill(0xffffff, 0);
  faultBox.drawRoundedRect(left.vs, left.tcl, 20, 20, 4);
  faultBox.pivot = new PIXI.Point(10, 10);
  faultBox.endFill();
  container.addChild(faultBox);

  // -------------------------------------- Right nodes
  const totCircleRight = new PIXI.Graphics();
  totCircleRight.lineStyle(2, white - 1, 1);
  totCircleRight.beginFill(red);
  totCircleRight.drawCircle(right.vs, right.tot, 10);
  totCircleRight.endFill();
  // container.addChild(totCircleRight);
  const botCircleRight = new PIXI.Graphics();
  botCircleRight.lineStyle(2, white, 1);
  botCircleRight.beginFill(red);
  botCircleRight.drawCircle(right.vs, right.bot, 10);
  botCircleRight.endFill();
  subscribeToMoveEvents(botCircleRight, function(pos) {
    this.x = pos.x;
    this.y = pos.y;
  });
  // container.addChild(botCircleRight);
  const dipBox = new PIXI.Graphics();
  dipBox.lineStyle(2, red);
  dipBox.beginFill(white, 0);
  dipBox.drawRoundedRect(right.vs - 10, right.tcl - 10, 20, 20, 4);
  // dipBox.pivot = new PIXI.Point(10, 10);
  dipBox.endFill();
  container.addChild(dipBox);
  dipBox.addChild(totCircleRight);
  dipBox.addChild(botCircleRight);
  subscribeToMoveEvents(dipBox, function(pos) {
    this.x = pos.x;
    this.y = pos.y;
  });
}

export { subscribeToMoveEvents, addDemoFormations, drawProjections };
