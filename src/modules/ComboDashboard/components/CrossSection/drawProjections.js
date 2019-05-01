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

function interactiveProjection(container, viewProps, pointUpdate, width, height) {
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
    pointUpdate(prev => {
      const diff = prev.leftTot - prev.leftBot;
      return {
        leftVs: pos.x,
        leftTot: pos.y,
        leftBot: pos.y - diff
      };
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
    pointUpdate(prev => {
      const diff = prev.leftTot - prev.leftBot;
      return {
        leftVs: pos.x,
        leftBot: pos.y,
        leftTot: pos.y + diff
      };
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
    pointUpdate(prev => {
      const diff = prev.rightTot - prev.rightBot;
      return {
        rightVs: pos.x,
        rightTot: pos.y,
        rightBot: pos.y - diff
      };
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
    pointUpdate(prev => {
      const diff = prev.rightTot - prev.rightBot;
      return {
        rightVs: pos.x,
        rightBot: pos.y,
        rightTot: pos.y + diff
      };
    });
  });

  const faultLine = new PIXI.Graphics();
  faultLine.lineStyle(...lineStyle);
  faultLine.moveTo(leftVs, 0).lineTo(leftVs, 10000);
  container.addChild(faultLine);

  const dipLine = new PIXI.Graphics();
  dipLine.lineStyle(...lineStyle);
  dipLine.moveTo(rightVs, 0).lineTo(rightVs, 10000);
  container.addChild(dipLine);

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

  return (viewProps, width, height) => {
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
    dipLine.clear().lineStyle(2 / container.transform.worldTransform.a, red, 1);
    dipLine.moveTo(rightVs, 0).lineTo(rightVs, 10000);
    faultLine.clear().lineStyle(2 / container.transform.worldTransform.a, red, 1);
    faultLine.moveTo(leftVs, 0).lineTo(leftVs, 10000);
  };
}

export { interactiveProjection, drawProjections };
