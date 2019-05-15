import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const selectedSurvey = [0x000000, 1];
const projection = [0xee2211, 0.5];
const selectedLastSurvey = [0x0000ff, 1];
const selectedProjection = [0xee2211, 1];

function drawSections(container, props, gutter) {
  const buttonHeight = 10;
  const pixiList = [];
  const bg = new PIXI.Graphics();
  bg.transform.updateTransform = frozenXYTransform;
  container.addChild(bg);
  const selectedLeft = new PIXI.Graphics();
  selectedLeft.transform.updateTransform = frozenXYTransform;
  container.addChild(selectedLeft);

  const selectedRight = new PIXI.Graphics();
  selectedRight.transform.updateTransform = frozenXYTransform;
  container.addChild(selectedRight);

  const addSection = function() {
    const section = new PIXI.Graphics();
    section.transform.updateTransform = frozenXYTransform;
    section.interactive = true;
    section.on("click", function() {
      props.setSelectedList(this.sectionIndex);
    });
    container.addChild(section);
    return section;
  };

  return function update(props) {
    if (!container.transform) return;
    const { surveys, projections, width, height, view, lastSurveyIdx, selectedList } = props;
    const points = surveys.slice(0, surveys.length - 1).concat(projections);
    const y = height - gutter - buttonHeight;

    bg.clear().beginFill(0xffffff);
    bg.drawRect(0, y - 2, width, buttonHeight + 2);
    selectedLeft.clear();
    selectedRight.clear();

    let start = 0;
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (!pixiList[i]) pixiList[i] = addSection();
      let pixi = pixiList[i];
      pixi.sectionIndex = i;
      const p1 = points[i].vs;
      const p2 = points[i + 1].vs;
      let color;
      if (selectedList[i]) {
        color = i >= lastSurveyIdx - 1 ? selectedProjection : selectedSurvey;
      } else {
        color = i >= lastSurveyIdx - 1 ? projection : survey;
      }
      pixi.clear().beginFill(...color);

      start = p1 * view.xScale + view.x;
      length = (p2 - p1) * view.xScale;
      if (start > width) continue;
      if (start + length < 0) continue;
      pixi.drawRoundedRect(start + 2, y, length - 4, buttonHeight, buttonHeight / 2);
      if (selectedList[i]) {
        selectedLeft.lineStyle(2, color[0], 0.5);
        selectedLeft.moveTo(start, 0).lineTo(start, height);
        selectedRight.lineStyle(2, color[0], 0.5);
        selectedRight.moveTo(start + length, 0).lineTo(start + length, height);
      }
    }
  };
}

export { drawSections };
