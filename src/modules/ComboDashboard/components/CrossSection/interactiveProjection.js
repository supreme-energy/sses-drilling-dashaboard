import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";

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
function interactiveProjection(parent, props) {
  const container = parent.addChild(new PIXI.Container());
  const { updateView: pointUpdate, lastSurveyIdx, selectedList } = props;
  const red = 0xee2211;
  const white = 0xffffff;

  // -------------------------------------- Line segments
  const totLine = new PIXI.Graphics();
  totLine.transform.updateTransform = frozenXYTransform;
  container.addChild(totLine);

  const tclLine = new PIXI.Graphics();
  tclLine.transform.updateTransform = frozenXYTransform;
  container.addChild(tclLine);

  const botLine = new PIXI.Graphics();
  botLine.transform.updateTransform = frozenXYTransform;
  container.addChild(botLine);

  // -------------------------------------- Left nodes
  const totCircle = new PIXI.Graphics();
  totCircle.lineStyle(2, red).beginFill(red, 0.4);
  totCircle.drawCircle(0, 0, 10);
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
  projectionPoint.transform.updateTransform = frozenScaleTransform;
  container.addChild(projectionPoint);
  subscribeToMoveEvents(projectionPoint, function(pos) {
    pointUpdate({
      paVs: pos.x,
      paTcl: pos.y
    });
  });

  return props => {
    const { selectedList, lastSurveyIdx } = props;
    const selectedIndex = selectedList.findIndex(e => e);
    // If there isn't a selected project ahead segment, don't display the interactive component
    if (selectedIndex === -1 || selectedIndex < lastSurveyIdx ) {
      container.visible = false;
      return;
    }
    container.visible = true;

    if (
      !totCircleRight.transform ||
      !botCircleRight.transform ||
      !projectionPoint.transform ||
      !totCircle.transform ||
      !botCircle.transform
    ) {
      return;
    }
    const { leftVs, leftTot, leftBot, rightVs, rightTot, rightBot, paVs, paTcl } = props.view;
    const { x, y, xScale, yScale } = props.view;
    const xMap = val => val * xScale + x;
    const yMap = val => val * yScale + y;

    totCircle.position.x = leftVs;
    totCircle.position.y = leftTot;
    botCircle.position.x = leftVs;
    botCircle.position.y = leftBot;
    totCircleRight.position.x = rightVs;
    totCircleRight.position.y = rightTot;
    botCircleRight.position.x = rightVs;
    botCircleRight.position.y = rightBot;
    projectionPoint.position.x = rightVs;
    projectionPoint.position.y = paTcl;

    totLine.clear().lineStyle(2, red, 1);
    totLine.moveTo(xMap(leftVs), yMap(leftTot)).lineTo(xMap(rightVs), yMap(rightTot));
    tclLine.clear().lineStyle(2, red, 1);
    tclLine.moveTo(xMap(leftVs), yMap((leftTot + leftBot) / 2)).lineTo(xMap(rightVs), yMap((rightTot + rightBot) / 2));
    botLine.clear().lineStyle(2, red, 1);
    botLine.moveTo(xMap(leftVs), yMap(leftBot)).lineTo(xMap(rightVs), yMap(rightBot));
  };
}

export { interactiveProjection };
