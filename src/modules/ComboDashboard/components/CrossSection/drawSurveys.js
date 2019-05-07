import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

/* eslint new-cap: 0 */
export function drawSurveys(container, surveyData) {
  const surveyMarker = new PIXI.Texture.fromImage("/survey.svg");
  const surveyGraphics = [];
  let prevDataLength = surveyData.length;

  const addSurvey = function() {
    let icon = new PIXI.Sprite(surveyMarker);
    icon.scale.set(0.4);
    icon.anchor.set(0.5, 0.5);
    icon.transform.updateTransform = frozenScaleTransform;
    surveyGraphics.push(icon);
    container.addChild(icon);
    return icon;
  };

  return function(surveys) {
    if (surveys.length === 0 || surveys.length === prevDataLength) return;
    prevDataLength = surveys.length;
    for (let i = 0; i < surveys.length; i++) {
      if (!surveyGraphics[i]) surveyGraphics[i] = addSurvey();
      surveyGraphics[i].position.x = surveys[i].vs;
      surveyGraphics[i].position.y = surveys[i].tvd;
    }
  };
}
