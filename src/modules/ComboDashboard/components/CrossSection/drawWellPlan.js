import * as PIXI from "pixi.js";

export function drawWellPlan(container, wellPlanData) {
  // Initialize the well plan object
  const wellplan = new PIXI.Graphics();
  container.addChild(wellplan);
  update(wellPlanData);

  return update;

  function update(planData) {
    if (planData.length === 0 || !wellplan.transform) return;
    wellplan.clear().lineStyle(3 / container.transform.worldTransform.a, 0x44ff44, 1);
    wellplan.moveTo(planData[0].vs, planData[0].tvd);
    for (let i = 1; i < planData.length; i++) {
      wellplan.lineTo(planData[i].vs, planData[i].tvd);
    }
  }
}
