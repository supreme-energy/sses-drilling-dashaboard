import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

/**
 * Draw a line representing the projected drill path
 * @param container  The pixi container to draw on
 * @param props      The props provided to the pixi cross section
 */
function drawProjections(container, props) {
  const projectionGraphics = [];

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

  function update(props) {
    const { calcSections, lastSurveyIdx } = props;
    if (!calcSections.length || calcSections.length < lastSurveyIdx + 2) return;

    for (let i = lastSurveyIdx + 2; i < calcSections.length; i++) {
      if (!projectionGraphics[i]) projectionGraphics[i] = addProjection();
      projectionGraphics[i].position.x = calcSections[i].vs;
      projectionGraphics[i].position.y = calcSections[i].tvd;
    }
  }
}

export { drawProjections };
