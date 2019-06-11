import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";

/* eslint new-cap: 0 */
export function drawSurveys(container) {
  const surveyMarker = new PIXI.Texture.fromImage("/survey.svg");
  const lastMarker = new PIXI.Texture.fromImage("/lastSurvey.svg");
  const bitProjection = new PIXI.Texture.fromImage("/bitProjection.svg");
  const paMarker = new PIXI.Texture.fromImage("/projectAhead.svg");
  const surveyGraphics = [];

  const widePath = container.addChild(new PIXI.Graphics());
  widePath.transform.updateTransform = frozenXYTransform;
  const narrowPath = container.addChild(new PIXI.Graphics());
  narrowPath.transform.updateTransform = frozenXYTransform;

  const addSurvey = function() {
    let icon = container.addChild(new PIXI.Sprite(surveyMarker));
    icon.scale.set(0.4);
    icon.anchor.set(0.5, 0.5);
    icon.transform.updateTransform = frozenScaleTransform;
    return icon;
  };

  function redrawLine(surveys, scale, line, width, color) {
    line.clear().lineStyle(width, color, 1);
    line.moveTo(...scale(surveys[0].vs, surveys[0].tvd));
    for (let i = 1; i < surveys.length; i++) {
      line.lineTo(...scale(surveys[i].vs, surveys[i].tvd));
    }
  }

  function getTexture(point) {
    if (point.isLastSurvey) return lastMarker;
    else if (point.isBitProj) return bitProjection;
    else if (point.isProjection) return paMarker;
    else return surveyMarker;
  }

  return function(props) {
    const { calcSections, scale } = props;
    widePath.clear();
    narrowPath.clear();
    surveyGraphics.forEach(g => (g.visible = false));
    if (calcSections.length === 0) {
      return;
    }
    const surveys = calcSections.filter(s => s.isSurvey);
    if (surveys.length > 1) {
      redrawLine(surveys, scale, widePath, 6, 0x333333);
      redrawLine(surveys, scale, narrowPath, 2, 0xffffff);
    }

    for (let i = 0; i < calcSections.length; i++) {
      if (!surveyGraphics[i]) surveyGraphics[i] = addSurvey();

      surveyGraphics[i].position.x = calcSections[i].vs;
      surveyGraphics[i].position.y = calcSections[i].tvd;
      surveyGraphics[i].texture = getTexture(calcSections[i]);
      surveyGraphics[i].visible = true;
    }
  };
}
