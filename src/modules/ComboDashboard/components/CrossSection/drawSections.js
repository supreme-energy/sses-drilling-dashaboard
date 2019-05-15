import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const projection = [0xee2211, 0.5];

function drawSections(container, gutter) {
  const buttonHeight = 10;
  const pixiList = [];

  const addSection = function() {
    const section = new PIXI.Graphics();
    section.transform.updateTransform = frozenXYTransform;
    pixiList.push(section);
    container.addChild(section);
    return section;
  };

  return function update(props) {
    const { surveys, projections, width, height, view } = props;
    if (!container.transform) return;
    const points = surveys.slice(0, surveys.length - 1).concat(projections);
    const y = height - gutter - buttonHeight;

    let start = 0;
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (!pixiList[i]) pixiList[i] = addSection();
      let pixi = pixiList[i];
      let p1 = Number(points[i].vs);
      let p2 = Number(points[i + 1].vs);
      const color = i >= surveys.length - 2 ? projection : survey;
      pixi.clear().beginFill(...color);
      // drawRoundedRect may not be performant enough.
      // consider drawing lines with a curved 'I' shape bounding the ends
      start = p1 * view.xScale + view.x;
      length = (p2 - p1) * view.xScale;
      if (start > width) continue;
      if (start + length < 0) continue;
      pixi.drawRoundedRect(start + 2, y, length - 4, buttonHeight, buttonHeight / 2);
    }
  };
}

export { drawSections };
