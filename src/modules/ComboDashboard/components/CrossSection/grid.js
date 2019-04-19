import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform, frozenYTransform } from "./customPixiTransforms";

function buildAutoScalingGrid(container, width, height) {
  const maxXLines = 45;
  const maxYLines = 12;
  const tickLabelFontSize = 15;
  const gutter = 50;
  let lastStep = 0;
  let lastMinX = 0;
  let lastMinY = 0;

  const xLabels = [];
  const xLines = [];
  for (let i = 0; i < maxXLines; i++) {
    let label = new PIXI.Text("", {
      fill: "#999",
      fontSize: tickLabelFontSize
    });
    label.anchor.set(1, 0.5);
    label.rotation = Math.PI / 2;
    label.y = height;
    label.transform.updateTransform = frozenXTransform;
    xLabels.push(label);

    // Using GraphicsGeometry may offer performance boost here
    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xaaaaaa, 0.25);
    line.moveTo(0, 0);
    line.lineTo(0, height);
    line.transform.updateTransform = frozenXTransform;
    xLines.push(line);
  }

  const yLabels = [];
  const yLines = [];
  for (let i = 0; i < maxYLines; i++) {
    let label = new PIXI.Text("", {
      fill: "#999",
      fontSize: tickLabelFontSize
    });
    label.anchor.set(0, 0.5);
    label.x = 5;
    label.transform.updateTransform = frozenYTransform;
    yLabels.push(label);

    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xaaaaaa, 0.25);
    line.moveTo(0, 0);
    line.lineTo(width, 0);
    line.transform.updateTransform = frozenYTransform;
    yLines.push(line);
  }
  // Add the elements of the grid in the correct order
  // Lines are first
  xLines.forEach(l => container.addChild(l));
  yLines.forEach(l => container.addChild(l));

  // White background behind tick labels
  let bgx = new PIXI.Graphics();
  bgx.beginFill(0xffffff);
  bgx.lineStyle(0);
  bgx.drawRect(0, 0, gutter, height);
  bgx.transform.updateTransform = frozenXYTransform;
  container.addChild(bgx);

  let bgy = new PIXI.Graphics();
  bgy.beginFill(0xffffff);
  bgy.lineStyle(0);
  bgy.drawRect(0, height - gutter, width, gutter);
  bgy.transform.updateTransform = frozenXYTransform;
  container.addChild(bgy);

  // Tick labels
  xLabels.forEach(l => container.addChild(l));
  yLabels.forEach(l => container.addChild(l));
  // Corner to hide overlapping tick labels
  let corner = new PIXI.Graphics();
  corner.beginFill(0xffffff);
  corner.drawRect(0, height - gutter, gutter, gutter);
  corner.transform.updateTransform = frozenXYTransform;
  container.addChild(corner);

  function calcSteps(xMin, xMax, yMin, yMax, tickCount) {
    const yRange = yMax - yMin;

    const roughStep = yRange / (tickCount - 1);

    const goodSteps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    const step = goodSteps.find(s => s >= roughStep);

    return {
      xMin: Math.floor(xMin / step) * step,
      xMax: Math.ceil(xMax / step) * step,
      step: step,
      yMin: Math.floor(yMin / step) * step,
      yMax: Math.ceil(yMax / step) * step
    };
  }

  return function updateGrid() {
    // Sometimes transform is undefined and we need it for position/scale
    if (!container.transform) return;
    const minVisibleX = Math.floor((-1 * container.position._x) / container.scale._x);
    const maxVisibleX = minVisibleX + Math.floor(width / container.scale._x);
    const minVisibleY = Math.floor((-1 * container.position._y) / container.scale._y);
    const maxVisibleY = minVisibleY + Math.floor(height / container.scale._y);

    let { xMax, xMin, yMax, yMin, step } = calcSteps(minVisibleX, maxVisibleX, minVisibleY, maxVisibleY, maxYLines);
    if (xMin !== lastMinX || step !== lastStep) {
      for (let i = 0; i < xLines.length; i++) {
        xLines[i].x = xMin + step * i;
        xLabels[i].text = `${xMin + i * step}`;
        xLabels[i].x = xMin + step * i;
      }
      lastMinX = xMin;
    }

    if (yMin !== lastMinY || step !== lastStep) {
      for (let i = 0; i < yLines.length; i++) {
        yLines[i].y = yMin + step * i;
        yLabels[i].text = `${yMin + i * step}`;
        yLabels[i].y = yMin + step * i;
      }
      lastStep = step;
      lastMinY = yMin;
    }
  };
}

export { buildAutoScalingGrid };
