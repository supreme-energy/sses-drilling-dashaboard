import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform } from "./customPixiTransforms";
import { subscribeToMoveEvents } from "./pixiUtils";
import memoizeOne from "memoize-one";

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
      props.setSelectedSections({
        type: "toggle",
        id: this.sectionId
      });
    });
    container.addChild(section);
    return section;
  };

  return function update(props) {
    if (!container.transform) return;
    const { width, height, view, selectedSections, calcSections } = props;
    console.log("calcSections", calcSections);
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
      const p1 = calcSections[i - 1];
      const p2 = calcSections[i];
      const isSelected = selectedSections[p2.id];
      const color = isSelected ? [p2.selectedColor, p2.selectedAlpha] : [p2.color, p2.alpha];

      const pixi = pixiList[i];
      pixi.beginFill(...color);
      pixi.sectionId = p2.id;

      const start = p1.vs * view.xScale + view.x;
      const length = (p2.vs - p1.vs) * view.xScale;
      if (start > width) continue;
      if (start + length < 0) continue;
      pixi.drawRoundedRect(start + 2, y, length - 4, buttonHeight, buttonHeight / 2);

      if (selectedSections[p2.id]) {
        selectedLeft.lineStyle(2, color[0], 0.5);
        selectedLeft.moveTo(start, 0).lineTo(start, height);
        selectedRight.lineStyle(2, color[0], 0.5);
        selectedRight.moveTo(start + length, 0).lineTo(start + length, height);

        memoInitLabel(color[0]);
        selectedLabel.visible = true;
        selectedLabel.position.x = p2.vs;
        selectedLabel.position.y = height - gutter;
        labelText.text = p2.vs.toFixed(2);
      }
    }
  };
}

export { drawSections };
