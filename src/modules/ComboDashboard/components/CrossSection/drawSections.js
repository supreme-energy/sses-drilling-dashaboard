import * as PIXI from "pixi.js";
import { frozenXTransform } from "./customPixiTransforms";

const survey = [0xa6a6a6, 0.5];
const projection = [0xee2211, 0.5];

function drawSections(container, width, height, surveys, projections, gutter) {
  const buttonHeight = 10;
  const y = height - gutter - buttonHeight;
  const pixiList = [];
  // The update function immediately stops re-rendering as soon as the scale
  // is equal to the previous scale.  However, that doesn't re-align the sections
  // to where they should be.  Allowing for another couple of frame renders fixes this.
  const backdownFactor = 10;
  let backdown = 0;
  let prevScaleX = 1;

  const addSection = function() {
    const section = new PIXI.Graphics();
    section.transform.updateTransform = frozenXTransform;
    pixiList.push(section);
    container.addChild(section);
    return section;
  };

  return function update(props) {
    const { surveys, projections, view } = props;
    if (!surveys.length || (view.xScale === prevScaleX && backdown === 0)) return;
    prevScaleX = view.xScale;
    if (backdown === 0) {
      backdown = backdownFactor;
    } else {
      backdown -= 1;
    }
    if (!container.transform || !surveys.length || !projections.length) return;
    const points = surveys.slice(0, surveys.length - 1).concat(projections);
    const scale = container.transform.worldTransform.a;

    for (let i = 0; i < points.length - 1; i++) {
      if (!pixiList[i]) pixiList[i] = addSection();
      let pixi = pixiList[i];
      let p1 = Number(points[i].vs);
      let p2 = Number(points[i + 1].vs);
      const color = i >= surveys.length - 2 ? projection : survey;
      pixi.clear().beginFill(...color);
      // drawRoundedRect may not be performant enough.
      // consider drawing lines with a curved 'I' shape bounding the ends
      pixi.drawRoundedRect(p1 * scale + 2, y, (p2 - p1) * scale - 2, buttonHeight, buttonHeight / 2);
    }
  };
}

export { drawSections };
