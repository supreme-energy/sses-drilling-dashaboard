import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

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

export { drawProjections };
