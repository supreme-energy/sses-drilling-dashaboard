import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const projection = [0xee2211, 0.5];

function drawSections(container, width, height, surveys, projections) {
  let points = surveys.slice(0, surveys.length - 1).concat(projections);
  const buttonHeight = 10;

  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
    const section = new PIXI.Graphics();
    const color = i >= surveys.length - 2 ? projection : survey;
    section.beginFill(...color);
    section.drawRoundedRect(Number(p1.vs) + 2, height - 50, Number(p2.vs - p1.vs) - 2, buttonHeight, buttonHeight / 2);
    section.endFill();
    section.transform.updateTransform = frozenXTransform;
    container.addChild(section);
  }

  return function update() {};
}

export { drawSections };
