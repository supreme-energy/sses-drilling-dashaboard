import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXYTransform } from "./customPixiTransforms";
import surveySVG from "../../../../assets/survey.svg";
import tieInSVG from "../../../../assets/tieIn.svg";
import lastSurveySVG from "../../../../assets/lastSurvey.svg";
import bitProjectionSVG from "../../../../assets/bitProjection.svg";
import projectionAutoDip from "../../../../assets/projectionAutoDip.svg";
import projectionStatic from "../../../../assets/projectionStatic.svg";
import projectionDirectional from "../../../../assets/projectionDirectional.svg";
import { MD_INC_AZ, TVD_VS } from "../../../../constants/calcMethods";

/* eslint new-cap: 0 */
export function drawSurveys(container) {
  const surveyMarker = PIXI.Texture.from(surveySVG);
  const tieInMarker = PIXI.Texture.from(tieInSVG);
  const lastMarker = PIXI.Texture.from(lastSurveySVG);
  const bitProjection = PIXI.Texture.from(bitProjectionSVG);
  const paAutoDip = PIXI.Texture.from(projectionAutoDip);
  const paStatic = PIXI.Texture.from(projectionStatic);
  const paDirectional = PIXI.Texture.from(projectionDirectional);
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

  function redrawLine(surveys, scale, line, width, color, xField, yField, yDirection) {
    line.clear().lineStyle(width, color, 1);
    line.moveTo(...scale(surveys[0][xField], surveys[0][yField] * yDirection));
    for (let i = 1; i < surveys.length; i++) {
      line.lineTo(...scale(surveys[i][xField], surveys[i][yField] * yDirection));
    }
  }

  function getTexture(point) {
    if (point.isLastSurvey) return lastMarker;
    else if (point.isTieIn) return tieInMarker;
    else if (point.isBitProj) return bitProjection;
    else if (point.isProjection) {
      if (point.method === TVD_VS) return paStatic;
      else if (point.method === MD_INC_AZ) return paDirectional;
      else return paAutoDip;
    } else {
      return surveyMarker;
    }
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
      redrawLine(surveys, scale, widePath, 6, 0x333333, xField, yField, yAxisDirection);
      redrawLine(surveys, scale, narrowPath, 2, 0xffffff, xField, yField, yAxisDirection);
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
