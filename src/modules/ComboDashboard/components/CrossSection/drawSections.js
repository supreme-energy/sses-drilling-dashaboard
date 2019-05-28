import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const projection = [0xee2211, 0.5];
const selectedSurvey = [0x000000, 1];
const selectedLastSurvey = [0x0000ff, 1];
const selectedProjection = [0xee2211, 1];

function getColor(selectedSections, index, lastSurveyIdx) {
  const isSelected = selectedSections[index];
  const isProjection = index > lastSurveyIdx;
  let color;
  if (isSelected) {
    color = isProjection ? selectedProjection : selectedSurvey;
  } else {
    color = isProjection ? projection : survey;
  }
  if (index === lastSurveyIdx && isSelected) color = selectedLastSurvey;
  return color;
}

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
      props.setselectedSections(this.sectionIndex);
    });
    container.addChild(section);
    return section;
  };

  return function update(props) {
    if (!container.transform) return;
    const { width, height, view, lastSurveyIdx, selectedSections, allSections } = props;
    const points = allSections;
    const y = height - gutter - buttonHeight;

    bg.clear().beginFill(0xffffff);
    bg.drawRect(0, y - 2, width, buttonHeight + 2);
    selectedLeft.clear();
    selectedRight.clear();

    let start = 0;
    let length = 0;
    for (let i = 1; i <= points.length - 1; i++) {
      if (!pixiList[i]) pixiList[i] = addSection();
      const p1 = points[i - 1].vs;
      const p2 = points[i].vs;
      const color = getColor(selectedSections, i, lastSurveyIdx);

      const pixi = pixiList[i];
      pixi.clear().beginFill(...color);
      pixi.sectionIndex = i;

      start = p1 * view.xScale + view.x;
      length = (p2 - p1) * view.xScale;
      if (start > width) continue;
      if (start + length < 0) continue;
      pixi.drawRoundedRect(start + 2, y, length - 4, buttonHeight, buttonHeight / 2);

      if (selectedSections[i]) {
        selectedLeft.lineStyle(2, color[0], 0.5);
        selectedLeft.moveTo(start, 0).lineTo(start, height);
        selectedRight.lineStyle(2, color[0], 0.5);
        selectedRight.moveTo(start + length, 0).lineTo(start + length, height);
      }
    }
  };
}

export { drawSections };
