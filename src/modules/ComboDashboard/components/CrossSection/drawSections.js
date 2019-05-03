import * as PIXI from "pixi.js";
import { frozenXTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const projection = [0xee2211, 0.5];

function drawSections(container, width, height, surveys, projections, gutter) {
  const points = surveys.slice(0, surveys.length - 1).concat(projections);
  const buttonHeight = 10;
  const y = height - gutter - buttonHeight;
  const pixiList = [];

  for (let i = 0; i < points.length - 1; i++) {
    const section = new PIXI.Graphics();
    section.transform.updateTransform = frozenXTransform;
    pixiList.push(section);
    container.addChild(section);
  }

  return function update() {
    if (!container.transform) return;
    const scale = container.transform.worldTransform.a;
    for (let i = 0; i < points.length - 1; i++) {
      let pixi = pixiList[i];
      let p1 = Number(points[i].vs);
      let p2 = Number(points[i + 1].vs);
      const color = i >= surveys.length - 2 ? projection : survey;
      pixi.clear().beginFill(...color);
      pixi.drawRoundedRect(p1 * scale + 2, y, (p2 - p1) * scale - 2, buttonHeight, buttonHeight / 2);
    }
  };
}

export { drawSections };
