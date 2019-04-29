import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";

/**
 * Draw a line representing the projected drill path
 * @param container  The pixi container to draw on
 * @param projections An array of projected points
 */
function drawProjections(container, projections) {
  // -------------------------------------- Trace projection
  const wpData = projections.map(x => [Number(x.vs), Number(x.tvd)]);
  const projectedPath = new PIXI.Graphics();
  update();
  container.addChild(projectedPath);

  return update;

  function update() {
    if (!projectedPath.transform) return;
    projectedPath.clear().lineStyle(3 / container.transform.worldTransform.a, 0xee3322, 1);
    projectedPath.moveTo(...wpData[0]);
    for (let i = 1; i < wpData.length; i++) {
      projectedPath.lineTo(...wpData[i]);
    }
  }
}

function interactiveProjection(container, viewProps, pointUpdate) {
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
  totCircle.transform.updateTransform = frozenScaleTransform;
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
  botCircle.transform.updateTransform = frozenScaleTransform;
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
  totCircleRight.transform.updateTransform = frozenScaleTransform;
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
  botCircleRight.transform.updateTransform = frozenScaleTransform;
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
  dipBox.transform.updateTransform = frozenScaleTransform;
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

    totLine.clear().lineStyle(2 / container.transform.worldTransform.a, red, 1);
    totLine.moveTo(leftVs, leftTot).lineTo(rightVs, rightTot);
    tclLine.clear().lineStyle(2 / container.transform.worldTransform.a, red, 1);
    tclLine.moveTo(leftVs, (leftTot + leftBot) / 2).lineTo(rightVs, (rightTot + rightBot) / 2);
    botLine.clear().lineStyle(2 / container.transform.worldTransform.a, red, 1);
    botLine.moveTo(leftVs, leftBot).lineTo(rightVs, rightBot);
  };
}

export { interactiveProjection, drawProjections };
