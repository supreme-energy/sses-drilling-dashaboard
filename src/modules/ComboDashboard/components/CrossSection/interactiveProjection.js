import * as PIXI from "pixi.js";
import memoizeOne from "memoize-one";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";

function drawCircle(circle, lineColor, fillColor) {
  circle.clear();
  circle.lineStyle(2, lineColor).beginFill(fillColor, 0.4);
  circle.drawCircle(0, 0, 10);
}
function createCircle(container, lineColor, fillColor, cb, cbEnd) {
  const circle = container.addChild(new PIXI.Graphics());
  drawCircle(circle, lineColor, fillColor);
  circle.transform.updateTransform = frozenScaleTransform;
  subscribeToMoveEvents(circle, cb, cbEnd);
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
  const { updateSegments } = props;
  const red = 0xee2211;
  const white = 0xffffff;
  let prevMd, selectedMd;

  const totLine = container.addChild(new PIXI.Graphics());
  totLine.transform.updateTransform = frozenXYTransform;

  const tclLine = container.addChild(new PIXI.Graphics());
  tclLine.transform.updateTransform = frozenXYTransform;

  const botLine = container.addChild(new PIXI.Graphics());
  botLine.transform.updateTransform = frozenXYTransform;

  const prevTot = createCircle(container, red, red, function(pos) {
    updateSegments({ [prevMd]: { tot: pos.y } });
  });
  const prevBot = createCircle(container, red, red, function(pos) {
    updateSegments({ [prevMd]: { bot: pos.y } });
  });

  const currTot = createCircle(container, white, red, function(pos) {
    updateSegments({ [selectedMd]: { tot: pos.y, vs: pos.x } });
  });

  const currBot = createCircle(container, white, red, function(pos) {
    updateSegments({ [selectedMd]: { bot: pos.y, vs: pos.x } });
  });

  const memoSetKnobColor = memoizeOne(color => {
    drawCircle(prevTot, color, color);
    drawCircle(prevBot, color, color);
    drawCircle(currTot, white, color);
    drawCircle(currBot, white, color);
  });

  const paMarker = container.addChild(new PIXI.Graphics());
  paMarker.lineStyle(2, red).beginFill(white, 0.01);
  paMarker.drawRoundedRect(-9, -9, 18, 18, 4);
  paMarker.transform.updateTransform = frozenScaleTransform;
  subscribeToMoveEvents(paMarker, function(pos) {
    updateSegments({ [selectedMd]: { tvd: pos.y, vs: pos.x } });
  });

  return props => {
    const { selectedSections, calcSections, scale } = props;
    const id = Object.keys(selectedSections)[0];
    const selectedIndex = calcSections.findIndex(s => s.id === Number(id));
    // If there isn't a selected project ahead segment, don't display the interactive component
    if (!selectedSections[id] || selectedIndex <= 0) {
      container.visible = false;
      return;
    }
    container.visible = true;

    if (!currTot.transform || !currBot.transform || !paMarker.transform || !prevTot.transform || !prevBot.transform) {
      return;
    }
    const prev = calcSections[selectedIndex - 1];
    const pa = calcSections[selectedIndex];
    prevMd = prev.md;
    selectedMd = pa.md;

    memoSetKnobColor(pa.selectedColor);
    prevTot.position.x = prev.vs;
    prevTot.position.y = prev.tot;
    prevBot.position.x = prev.vs;
    prevBot.position.y = prev.bot;

    currTot.position.x = pa.vs;
    currTot.position.y = pa.tot - pa.fault;
    currBot.position.x = pa.vs;
    currBot.position.y = pa.bot - pa.fault;

    paMarker.position.x = pa.vs;
    paMarker.position.y = pa.tvd;

    totLine.clear().lineStyle(2, pa.selectedColor, 1);
    totLine.moveTo(...scale(prev.vs, prev.tot)).lineTo(...scale(pa.vs, pa.tot - pa.fault));
    tclLine.clear().lineStyle(2, pa.selectedColor, 1);
    tclLine.moveTo(...scale(prev.vs, prev.tcl)).lineTo(...scale(pa.vs, pa.tcl - pa.fault));
    botLine.clear().lineStyle(2, pa.selectedColor, 1);
    botLine.moveTo(...scale(prev.vs, prev.bot)).lineTo(...scale(pa.vs, pa.bot - pa.fault));
  };
}

export { interactiveProjection };
