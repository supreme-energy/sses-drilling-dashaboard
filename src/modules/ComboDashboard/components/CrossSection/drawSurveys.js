import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

/* eslint new-cap: 0 */
export function drawSurveys(container, surveyData) {
  const surveyMarker = new PIXI.Texture.fromImage("/survey.svg");
  update(surveyData);

  return update;

  function update(surveys) {
    if (surveys.length === 0) return;
    for (let i = 0; i < surveys.length; i++) {
      let icon = new PIXI.Sprite(surveyMarker);
      icon.position = new PIXI.Point(surveys[i].vs, surveys[i].tvd);
      icon.scale.set(0.4);
      icon.anchor.set(0.5, 0.5);
      icon.transform.updateTransform = frozenScaleTransform;
      container.addChild(icon);
    }
  }
}
