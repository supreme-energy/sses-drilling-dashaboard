import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";

/* eslint new-cap: 0 */
export function drawSurveys(container) {
  const surveyMarker = new PIXI.Texture.fromImage("/survey.svg");
  const lastMarker = new PIXI.Texture.fromImage("/lastSurvey.svg");
  const bitProjection = new PIXI.Texture.fromImage("/bitProjection.svg");
  const widePath = container.addChild(new PIXI.Graphics());
  widePath.transform.updateTransform = frozenXYTransform;
  const narrowPath = container.addChild(new PIXI.Graphics());
  narrowPath.transform.updateTransform = frozenXYTransform;
  const surveyGraphics = [];
  let prevDataLength = 0;

  const addSurvey = function() {
    let icon = new PIXI.Sprite(surveyMarker);
    icon.scale.set(0.4);
    icon.anchor.set(0.5, 0.5);
    icon.transform.updateTransform = frozenScaleTransform;
    container.addChild(icon);
    return icon;
  };

  function redrawLine(surveys, scale, line, width, color) {
    line.clear().lineStyle(width, color, 1);
    line.moveTo(...scale(surveys[0].vs, surveys[0].tvd));
    for (let i = 1; i < surveys.length - 1; i++) {
      line.lineTo(...scale(surveys[i].vs, surveys[i].tvd));
    }
  }

  return function(props) {
    const { surveys, scale } = props;
    if (surveys.length === 0) return;
    redrawLine(surveys, scale, widePath, 6, 0x333333);
    redrawLine(surveys, scale, narrowPath, 2, 0xffffff);

    if (surveys.length === prevDataLength) return;
    prevDataLength = surveys.length;

    for (let i = 0; i < surveys.length; i++) {
      if (!surveyGraphics[i]) surveyGraphics[i] = addSurvey();
      surveyGraphics[i].position.x = surveys[i].vs;
      surveyGraphics[i].position.y = surveys[i].tvd;
      surveyGraphics[i].texture = surveyMarker;
    }
    // Set the correct graphics for last survey and bit projection
    surveyGraphics[surveyGraphics.length - 1].texture = bitProjection;
    if (surveyGraphics.length > 1) surveyGraphics[surveyGraphics.length - 2].texture = lastMarker;
  };
}
