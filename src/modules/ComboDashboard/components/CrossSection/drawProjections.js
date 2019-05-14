import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";

/**
 * Draw a line representing the projected drill path
 * @param container  The pixi container to draw on
 * @param props      The props provided to the pixi cross section
 */
function drawProjections(container, props) {
  const projectionGraphics = [];
  let prevDataLength = props.projections.length;

  const addProjection = function() {
    let marker = new PIXI.Graphics();
    marker.lineStyle(1.6, 0xee2211);
    marker.beginFill(0xffffff, 0);
    marker.drawRoundedRect(-8, -8, 16, 16, 4);
    marker.endFill();
    marker.transform.updateTransform = frozenScaleTransform;
    container.addChild(marker);
    return marker;
  };

  return update;

  function update(projections) {
    if (!projections.length || projections.length === prevDataLength) return;
    prevDataLength = projections.length;

    for (let i = 0; i < projections.length; i++) {
      if (!projectionGraphics[i]) projectionGraphics[i] = addProjection();
      projectionGraphics[i].position.x = projections[i].vs;
      projectionGraphics[i].position.y = projections[i].tvd;
    }
  }
}

/**
 * Function to draw the interactive project ahead UI for a selected projection. Currently
 * only displays the UI and is not tied to real data.  Projections cannot be selected yet.
 *
 * @param container     The PIXI layer to draw on
 * @param viewProps     Object holding the position data for individual UI elements
 * @param pointUpdate   Function for updating the props (can take a function)
 * @param width         Current canvas width
 * @param height        Current canvas height
 * @returns {Function}  The update function to be called each tick
 */
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

  const faultLine = new PIXI.Graphics();
  faultLine.lineStyle(...lineStyle);
  faultLine.moveTo(leftVs, 0).lineTo(leftVs, 10000);
  container.addChild(faultLine);

  const dipLine = new PIXI.Graphics();
  dipLine.lineStyle(...lineStyle);
  dipLine.moveTo(rightVs, 0).lineTo(rightVs, 10000);
  container.addChild(dipLine);

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

  // -------------------------------------- Project ahead point
  const projectionPoint = new PIXI.Graphics();
  projectionPoint.lineStyle(2, red);
  projectionPoint.beginFill(white, 0);
  projectionPoint.drawRoundedRect(-10, -10, 20, 20, 4);
  projectionPoint.position = new PIXI.Point(paVs, paTcl);
  projectionPoint.endFill();
  projectionPoint.transform.updateTransform = frozenScaleTransform;
  container.addChild(projectionPoint);
  subscribeToMoveEvents(projectionPoint, function(pos) {
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
      !projectionPoint.transform ||
      !totCircle.transform ||
      !botCircle.transform
    ) {
      return;
    }
    totCircle.position.x = leftVs;
    totCircle.position.y = leftTot;
    botCircle.position.x = leftVs;
    botCircle.position.y = leftBot;
    totCircleRight.position.x = rightVs;
    totCircleRight.position.y = rightTot;
    botCircleRight.position.x = rightVs;
    botCircleRight.position.y = rightBot;
    projectionPoint.position.x = paVs;
    projectionPoint.position.y = paTcl;

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
