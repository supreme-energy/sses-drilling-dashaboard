import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "./customPixiTransforms";

export function drawSurveys(container, surveys) {
  const surveyMarker = new PIXI.Texture.fromImage("/survey.svg");

  const sData = surveys.map(x => [Number(x.vs), Number(x.tvd)]);
  for (let i = 0; i < sData.length; i++) {
    let icon = new PIXI.Sprite(surveyMarker);
    icon.position = new PIXI.Point(...sData[i]);
    icon.scale.set(0.4);
    icon.anchor.set(0.5, 0.5);
    icon.transform.updateTransform = frozenScaleTransform;
    container.addChild(icon);
  }
}
