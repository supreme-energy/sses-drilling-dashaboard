import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";

function createCircle(container, lineColor, fillColor, cb) {
  const circle = container.addChild(new PIXI.Graphics());
  circle.lineStyle(2, lineColor).beginFill(fillColor, 0.4);
  circle.drawCircle(0, 0, 10);
  circle.transform.updateTransform = frozenScaleTransform;
  subscribeToMoveEvents(circle, cb);
  return circle;
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
function interactiveProjection(parent, props) {
  const container = parent.addChild(new PIXI.Container());
  const { ghostDiffDispatch } = props;
  const red = 0xee2211;
  const white = 0xffffff;

  const totLine = container.addChild(new PIXI.Graphics());
  totLine.transform.updateTransform = frozenXYTransform;

  const tclLine = container.addChild(new PIXI.Graphics());
  tclLine.transform.updateTransform = frozenXYTransform;

  const botLine = container.addChild(new PIXI.Graphics());
  botLine.transform.updateTransform = frozenXYTransform;

  const prevTot = createCircle(container, red, red, function(pos) {
    ghostDiffDispatch({
      type: "fault_tot",
      tot: pos.y
    });
  });
  const prevBot = createCircle(container, red, red, function(pos) {
    ghostDiffDispatch({
      type: "fault_bot",
      bot: pos.y
    });
  });

  const currTot = createCircle(container, white, red, function(pos) {
    ghostDiffDispatch({
      type: "dip_tot",
      vs: pos.x,
      tot: pos.y
    });
  });

  const currBot = createCircle(container, white, red, function(pos) {
    ghostDiffDispatch({
      type: "dip_bot",
      vs: pos.x,
      bot: pos.y
    });
  });

  const paMarker = container.addChild(new PIXI.Graphics());
  paMarker.lineStyle(2, red).beginFill(white, 0);
  paMarker.drawRoundedRect(-9, -9, 18, 18, 4);
  paMarker.transform.updateTransform = frozenScaleTransform;
  subscribeToMoveEvents(paMarker, function(pos) {
    ghostDiffDispatch({
      type: "pa",
      tvd: pos.y,
      vs: pos.x
    });
  });

  return props => {
    const { selectedSections, lastSurveyIdx, calcSections, scale } = props;
    const selectedIndex = selectedSections.findIndex(e => e);
    // If there isn't a selected project ahead segment, don't display the interactive component
    if (selectedIndex === -1 || selectedIndex <= lastSurveyIdx) {
      container.visible = false;
      return;
    }
    container.visible = true;

    if (!currTot.transform || !currBot.transform || !paMarker.transform || !prevTot.transform || !prevBot.transform) {
      return;
    }
    const prev = calcSections[selectedIndex - 1];
    const pa = calcSections[selectedIndex];

    prevTot.position.x = prev.vs;
    prevTot.position.y = prev.tot + pa.fault;
    prevBot.position.x = prev.vs;
    prevBot.position.y = prev.bot + pa.fault;

    currTot.position.x = pa.vs;
    currTot.position.y = pa.tot;
    currBot.position.x = pa.vs;
    currBot.position.y = pa.bot;

    paMarker.position.x = pa.vs;
    paMarker.position.y = pa.tvd;

    totLine.clear().lineStyle(2, red, 1);
    totLine.moveTo(...scale(prev.vs, prev.tot + pa.fault)).lineTo(...scale(pa.vs, pa.tot));
    tclLine.clear().lineStyle(2, red, 1);
    tclLine.moveTo(...scale(prev.vs, prev.tcl + pa.fault)).lineTo(...scale(pa.vs, pa.tcl));
    botLine.clear().lineStyle(2, red, 1);
    botLine.moveTo(...scale(prev.vs, prev.bot + pa.fault)).lineTo(...scale(pa.vs, pa.bot));
  };
}

export { interactiveProjection };
