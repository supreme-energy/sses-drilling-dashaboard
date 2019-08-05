import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";
import surveySVG from "../../../../assets/survey.svg";
import lastSurveySVG from "../../../../assets/lastSurvey.svg";
import bitProjectionSVG from "../../../../assets/bitProjection.svg";
import projectAheadSVG from "../../../../assets/projectAhead.svg";

/* eslint new-cap: 0 */
export function drawSurveys(container) {
  const surveyMarker = PIXI.Texture.from(surveySVG);
  const lastMarker = PIXI.Texture.from(lastSurveySVG);
  const bitProjection = PIXI.Texture.from(bitProjectionSVG);
  const paMarker = PIXI.Texture.from(projectAheadSVG);
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

  function redrawLine(surveys, scale, line, width, color, xField, yField) {
    line.clear().lineStyle(width, color, 1);
    line.moveTo(...scale(surveys[0][xField], surveys[0][yField]));
    for (let i = 1; i < surveys.length; i++) {
      line.lineTo(...scale(surveys[i][xField], surveys[i][yField]));
    }
  }

  function getTexture(point) {
    if (point.isLastSurvey) return lastMarker;
    else if (point.isBitProj) return bitProjection;
    else if (point.isProjection) return paMarker;
    else return surveyMarker;
  }

  return function(props) {
    const { calcSections, scale, xField, yField, yAxisDirection } = props;
    widePath.clear();
    narrowPath.clear();
    surveyGraphics.forEach(g => (g.visible = false));
    if (calcSections.length === 0) {
      return;
    }
    const surveys = calcSections.filter(s => s.isSurvey);
    if (surveys.length > 1) {
      redrawLine(surveys, scale, widePath, 6, 0x333333, xField, yField * yAxisDirection);
      redrawLine(surveys, scale, narrowPath, 2, 0xffffff, xField, yField * yAxisDirection);
    }

    for (let i = 0; i < calcSections.length; i++) {
      if (!surveyGraphics[i]) surveyGraphics[i] = addSurvey();

      surveyGraphics[i].position.x = calcSections[i][xField];
      surveyGraphics[i].position.y = calcSections[i][yField] * yAxisDirection;
      surveyGraphics[i].texture = getTexture(calcSections[i]);
      surveyGraphics[i].visible = true;
    }
  };
}
