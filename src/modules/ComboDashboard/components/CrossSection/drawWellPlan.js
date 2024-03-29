import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

export function drawWellPlan(container) {
  // Initialize the well plan object
  const line = container.addChild(new PIXI.Graphics());
  line.transform.updateTransform = frozenXYTransform;

  return function update(props) {
    const { wellPlan, scale, xField, yField, yAxisDirection } = props;
    line.clear().lineStyle(3, 0x44ff44, 1);
    if (wellPlan.length === 0 || !line.transform) return;
    line.moveTo(...scale(wellPlan[0][xField], wellPlan[0][yField] * yAxisDirection));
    for (let i = 1; i < wellPlan.length; i++) {
      line.lineTo(...scale(wellPlan[i][xField], wellPlan[i][yField] * yAxisDirection));
    }
  };
}
