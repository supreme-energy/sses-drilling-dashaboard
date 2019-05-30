import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

/**
 * Draw a line representing the projected drill path
 * @param container  The pixi container to draw on
 * @param props      The props provided to the pixi cross section
 */
function drawProjections(container) {
  const svgMarker = new PIXI.Texture.fromImage("/projectAhead.svg");
  const projectionGraphics = [];

  const addProjection = function() {
    const marker = container.addChild(new PIXI.Sprite(svgMarker));
    marker.scale.set(0.4);
    marker.anchor.set(0.5);
    marker.transform.updateTransform = frozenScaleTransform;
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
