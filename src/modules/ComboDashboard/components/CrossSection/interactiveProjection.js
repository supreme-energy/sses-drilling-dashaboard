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
  const { interactivePADispatch } = props;
  const red = 0xee2211;
  const white = 0xffffff;

  const totLine = new PIXI.Graphics();
  totLine.transform.updateTransform = frozenXYTransform;
  container.addChild(totLine);

  const tclLine = new PIXI.Graphics();
  tclLine.transform.updateTransform = frozenXYTransform;
  container.addChild(tclLine);

  const botLine = new PIXI.Graphics();
  botLine.transform.updateTransform = frozenXYTransform;
  container.addChild(botLine);

  const prevTot = new PIXI.Graphics();
  prevTot.lineStyle(2, red).beginFill(red, 0.4);
  prevTot.drawCircle(0, 0, 10);
  prevTot.transform.updateTransform = frozenScaleTransform;
  container.addChild(prevTot);
  subscribeToMoveEvents(prevTot, function(pos) {
    interactivePADispatch({
      type: "fault_tot",
      tot: pos.y
    });
  });
  const prevBot = new PIXI.Graphics();
  prevBot.lineStyle(2, red).beginFill(red, 0.4);
  prevBot.drawCircle(0, 0, 10);
  prevBot.transform.updateTransform = frozenScaleTransform;
  container.addChild(prevBot);
  subscribeToMoveEvents(prevBot, function(pos) {
    interactivePADispatch({
      type: "fault_bot",
      bot: pos.y
    });
  });

  const currTot = new PIXI.Graphics();
  currTot.lineStyle(2, white, 1);
  currTot.beginFill(red);
  currTot.drawCircle(0, 0, 10);
  currTot.transform.updateTransform = frozenScaleTransform;
  container.addChild(currTot);
  subscribeToMoveEvents(currTot, function(pos) {
    interactivePADispatch({
      type: "dip_tot",
      vs: pos.x,
      tot: pos.y
    });
  });

  const currBot = new PIXI.Graphics();
  currBot.lineStyle(2, white, 1);
  currBot.beginFill(red);
  currBot.drawCircle(0, 0, 10);
  currBot.transform.updateTransform = frozenScaleTransform;
  container.addChild(currBot);
  subscribeToMoveEvents(currBot, function(pos) {
    interactivePADispatch({
      type: "dip_bot",
      vs: pos.x,
      bot: pos.y
    });
  });

  const paMarker = new PIXI.Graphics();
  paMarker.lineStyle(2, red);
  paMarker.beginFill(white, 0);
  paMarker.drawRoundedRect(-10, -10, 20, 20, 4);
  paMarker.transform.updateTransform = frozenScaleTransform;
  container.addChild(paMarker);
  subscribeToMoveEvents(paMarker, function(pos) {
    interactivePADispatch({
      type: "pa",
      tvd: pos.y,
      vs: pos.x
    });
  });

  return props => {
    const { selectedList, lastSurveyIdx, sectionList } = props;
    const selectedIndex = selectedList.findIndex(e => e);
    // If there isn't a selected project ahead segment, don't display the interactive component
    if (selectedIndex === -1 || selectedIndex <= lastSurveyIdx) {
      container.visible = false;
      return;
    }
    container.visible = true;

    if (!currTot.transform || !currBot.transform || !paMarker.transform || !prevTot.transform || !prevBot.transform) {
      return;
    }
    const { x, y, xScale, yScale } = props.view;
    const xMap = val => val * xScale + x;
    const yMap = val => val * yScale + y;
    const prev = sectionList[selectedIndex - 1];
    const pa = sectionList[selectedIndex];

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
    totLine.moveTo(xMap(prev.vs), yMap(prev.tot + pa.fault)).lineTo(xMap(pa.vs), yMap(pa.tot));
    tclLine.clear().lineStyle(2, red, 1);
    tclLine.moveTo(xMap(prev.vs), yMap(prev.tcl + pa.fault)).lineTo(xMap(pa.vs), yMap(pa.tcl));
    botLine.clear().lineStyle(2, red, 1);
    botLine.moveTo(xMap(prev.vs), yMap(prev.bot + pa.fault)).lineTo(xMap(pa.vs), yMap(pa.bot));
  };
}

export { interactiveProjection };
