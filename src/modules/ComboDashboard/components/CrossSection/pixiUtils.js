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
function addDemoFormations(container, formations, bitProjection) {
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

function drawProjections(container, projections, viewProps, pointUpdate) {
  // -------------------------------------- Trace projection
  const wpData = projections.map(x => [Number(x.vs), Number(x.tvd)]);
  const projectedPath = new PIXI.Graphics();
  projectedPath.lineStyle(3, 0xee3322, 1);
  projectedPath.moveTo(...wpData[0]);
  for (let i = 1; i < wpData.length; i++) {
    projectedPath.lineTo(...wpData[i]);
  }
  container.addChild(projectedPath);

  const { leftVs, leftTot, leftBot, rightVs, rightTot, rightBot, paVs, paTcl } = viewProps;
  const red = 0xee2211;
  const white = 0xffffff;
  const lineStyle = [2, red, 1];

  // -------------------------------------- Line segments
  const totLine = new PIXI.Graphics();
  totLine.lineStyle(...lineStyle);
  totLine.moveTo(leftVs, leftTot).lineTo(rightVs, rightTot);
  container.addChild(totLine);

  const tclLine = new PIXI.Graphics();
  tclLine.lineStyle(...lineStyle);
  tclLine.moveTo(leftVs, (leftTot + leftBot) / 2).lineTo(rightVs, (rightTot + rightBot) / 2);
  container.addChild(tclLine);

  const botLine = new PIXI.Graphics();
  botLine.lineStyle(...lineStyle);
  botLine.moveTo(leftVs, leftBot).lineTo(rightVs, rightBot);
  container.addChild(botLine);

  // -------------------------------------- Left nodes
  const totCircle = new PIXI.Graphics();
  totCircle.lineStyle(2, red).beginFill(red, 0.4);
  totCircle.drawCircle(0, 0, 10);
  totCircle.position = new PIXI.Point(leftVs, leftTot);
  totCircle.endFill();
  container.addChild(totCircle);
  subscribeToMoveEvents(totCircle, function(pos) {
    pointUpdate({
      leftVs: pos.x,
      leftTot: pos.y
    });
  });
  const botCircle = new PIXI.Graphics();
  botCircle.lineStyle(2, red).beginFill(red, 0.4);
  botCircle.drawCircle(0, 0, 10);
  botCircle.position = new PIXI.Point(leftVs, leftBot);
  botCircle.endFill();
  container.addChild(botCircle);
  subscribeToMoveEvents(botCircle, function(pos) {
    pointUpdate({
      leftVs: pos.x,
      leftBot: pos.y
    });
  });

  // -------------------------------------- Right nodes
  const totCircleRight = new PIXI.Graphics();
  totCircleRight.lineStyle(2, white, 1);
  totCircleRight.beginFill(red);
  totCircleRight.drawCircle(0, 0, 10);
  totCircleRight.position = new PIXI.Point(rightVs, rightTot);
  totCircleRight.endFill();
  container.addChild(totCircleRight);
  subscribeToMoveEvents(totCircleRight, function(pos) {
    pointUpdate({
      rightVs: pos.x,
      rightTot: pos.y
    });
  });

  const botCircleRight = new PIXI.Graphics();
  botCircleRight.lineStyle(2, white, 1);
  botCircleRight.beginFill(red);
  botCircleRight.drawCircle(0, 0, 10);
  botCircleRight.position = new PIXI.Point(rightVs, rightBot);
  botCircleRight.endFill();
  container.addChild(botCircleRight);
  subscribeToMoveEvents(botCircleRight, function(pos) {
    pointUpdate({
      rightVs: pos.x,
      rightBot: pos.y
    });
  });

  const dipBox = new PIXI.Graphics();
  dipBox.lineStyle(2, red);
  dipBox.beginFill(white, 0);
  dipBox.drawRoundedRect(-10, -10, 20, 20, 4);
  dipBox.position = new PIXI.Point(paVs, paTcl);
  dipBox.endFill();
  container.addChild(dipBox);
  subscribeToMoveEvents(dipBox, function(pos) {
    pointUpdate({
      paVs: pos.x,
      paTcl: pos.y
    });
  });

  return viewProps => {
    const { leftVs, leftTot, leftBot, rightVs, rightTot, rightBot, paVs, paTcl } = viewProps;
    if (
      !totCircleRight.transform ||
      !botCircleRight.transform ||
      !dipBox.transform ||
      !totCircle.transform ||
      !botCircle.transform
    ) {
      return;
    }
    totCircle.position = new PIXI.Point(leftVs, leftTot);
    botCircle.position = new PIXI.Point(leftVs, leftBot);
    totCircleRight.position = new PIXI.Point(rightVs, rightTot);
    botCircleRight.position = new PIXI.Point(rightVs, rightBot);
    dipBox.position = new PIXI.Point(paVs, paTcl);

    totLine.clear().lineStyle(...lineStyle);
    totLine.moveTo(leftVs, leftTot).lineTo(rightVs, rightTot);
    tclLine.clear().lineStyle(...lineStyle);
    tclLine.moveTo(leftVs, (leftTot + leftBot) / 2).lineTo(rightVs, (rightTot + rightBot) / 2);
    botLine.clear().lineStyle(...lineStyle);
    botLine.moveTo(leftVs, leftBot).lineTo(rightVs, rightBot);
  };
}

export { subscribeToMoveEvents, addDemoFormations, drawProjections };
