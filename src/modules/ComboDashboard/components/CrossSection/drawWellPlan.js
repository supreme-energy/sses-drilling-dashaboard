import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

export function drawWellPlan(container) {
  // Initialize the well plan object
  const line = container.addChild(new PIXI.Graphics());
  line.transform.updateTransform = frozenXYTransform;

  return update;

  function update(props) {
    const { wellPlan, scale } = props;
    if (wellPlan.length === 0 || !line.transform) return;
    line.clear().lineStyle(3, 0x44ff44, 1);
    line.moveTo(...scale(wellPlan[0].vs, wellPlan[0].tvd));
    for (let i = 1; i < wellPlan.length; i++) {
      line.lineTo(...scale(wellPlan[i].vs, wellPlan[i].tvd));
    }
  }
}
