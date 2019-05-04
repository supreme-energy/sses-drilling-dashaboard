import * as PIXI from "pixi.js";

export function drawWellPlan(container, wellPlanData) {
  // Draw the well plan line
  const wpData = wellPlanData.map(x => [Number(x.vs), Number(x.tvd)]);
  const wellplan = new PIXI.Graphics();
  update();
  container.addChild(wellplan);

  return update;

  function update() {
    if (!wellplan.transform) return;
    wellplan.clear().lineStyle(3 / container.transform.worldTransform.a, 0x44ff44, 1);
    wellplan.moveTo(...wpData[0]);
    for (let i = 1; i < wpData.length; i++) {
      wellplan.lineTo(...wpData[i]);
    }
  }
}
