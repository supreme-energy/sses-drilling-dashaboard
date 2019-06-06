import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";
import memoizeOne from "memoize-one";

const survey = [0xa6a6a6, 0.5];
const lastSurvey = [0x0000ff, 0.5];
const bitPrj = [0xff00ff, 0.5];
const projection = [0xee2211, 0.5];
const selectedSurvey = [0x000000, 1];
const selectedLastSurvey = [0x0000ff, 1];
const selectedBitPrj = [0xff00ff, 1];
const selectedProjection = [0xee2211, 1];

function getColor(selectedSections, index, lastSurveyIdx) {
  const isSelected = selectedSections[index];
  const isProjection = index > lastSurveyIdx;
  const isLastSurvey = index === lastSurveyIdx;
  const isBitPrj = index === lastSurveyIdx + 1;
  let color;

  if (isBitPrj) {
    color = isSelected ? selectedBitPrj : bitPrj;
  } else if (isLastSurvey) {
    color = isSelected ? selectedLastSurvey : lastSurvey;
  } else if (isProjection) {
    color = isSelected ? selectedProjection : projection;
  } else {
    color = isSelected ? selectedSurvey : survey;
  }
  return color;
}

function drawSections(container, higherContainer, props, gutter) {
  const { ghostDiffDispatch } = props;
  const buttonHeight = 10;
  const pixiList = [];

  const bg = container.addChild(new PIXI.Graphics());
  bg.transform.updateTransform = frozenXYTransform;

  const selectedLeft = container.addChild(new PIXI.Graphics());
  selectedLeft.transform.updateTransform = frozenXYTransform;

  const selectedRight = container.addChild(new PIXI.Graphics());
  selectedRight.transform.updateTransform = frozenXYTransform;

  const labelHeight = 75;
  const selectedLabel = higherContainer.addChild(new PIXI.Container());
  selectedLabel.transform.updateTransform = frozenXTransform;
  subscribeToMoveEvents(selectedLabel, function(pos) {
    ghostDiffDispatch({
      type: "tag_move",
      vs: pos.x
    });
  });
  const labelBG = selectedLabel.addChild(new PIXI.Graphics());
  labelBG.position.x = -10;
  const memoInitLabel = memoizeOne(color => {
    labelBG.beginFill(color, 1);
    labelBG.drawRoundedRect(0, 0, 20, labelHeight, 5);
  });

  const labelText = labelBG.addChild(new PIXI.Text("", { fill: "#fff", fontSize: 16 }));
  labelText.anchor.set(0.5, 1);
  labelText.rotation = Math.PI / 2;
  labelText.position.y = labelHeight / 2;

  const addSection = function() {
    const section = new PIXI.Graphics();
    section.transform.updateTransform = frozenXYTransform;
    section.interactive = true;
    section.on("click", function() {
      props.setSelectedSections(this.sectionIndex);
    });
    container.addChild(section);
    return section;
  };

  return function update(props) {
    if (!container.transform) return;
    const { width, height, view, lastSurveyIdx, selectedSections, calcSections } = props;
    const y = height - gutter - buttonHeight;

    bg.clear().beginFill(0xffffff);
    bg.drawRect(0, y - 2, width, buttonHeight + 2);
    selectedLeft.clear();
    selectedRight.clear();
    selectedLabel.visible = false;

    // Clear out all previous drawn sections
    pixiList.forEach(p => p.clear());
    for (let i = 1; i <= calcSections.length - 1; i++) {
      if (!pixiList[i]) pixiList[i] = addSection();
      const p1 = calcSections[i - 1].vs;
      const p2 = calcSections[i].vs;
      const color = getColor(selectedSections, i, lastSurveyIdx);

      const pixi = pixiList[i];
      pixi.beginFill(...color);
      pixi.sectionIndex = i;

      const start = p1 * view.xScale + view.x;
      const length = (p2 - p1) * view.xScale;
      if (start > width) continue;
      if (start + length < 0) continue;
      pixi.drawRoundedRect(start + 2, y, length - 4, buttonHeight, buttonHeight / 2);

      if (selectedSections[i]) {
        selectedLeft.lineStyle(2, color[0], 0.5);
        selectedLeft.moveTo(start, 0).lineTo(start, height);
        selectedRight.lineStyle(2, color[0], 0.5);
        selectedRight.moveTo(start + length, 0).lineTo(start + length, height);

        memoInitLabel(color[0]);
        selectedLabel.visible = true;
        selectedLabel.position.x = p2;
        selectedLabel.position.y = height - gutter;
        labelText.text = p2.toFixed(2);
      }
    }
  };
}

export { drawSections };
