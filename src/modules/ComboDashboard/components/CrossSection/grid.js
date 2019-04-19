import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform, frozenYTransform } from "./customPixiTransforms";

function makeXTickAndLine(fontSize, height) {
  let label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(1, 0.5);
  label.rotation = Math.PI / 2;
  label.y = height;
  label.transform.updateTransform = frozenXTransform;

  // Using GraphicsGeometry may offer performance boost here
  let line = new PIXI.Graphics();
  line.lineStyle(1, 0xaaaaaa, 0.25);
  line.moveTo(0, 0);
  line.lineTo(0, height);
  line.transform.updateTransform = frozenXTransform;

  return [line, label];
}
function makeYTickAndLine(fontSize, width) {
  let label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(0, 0.5);
  label.x = 5;
  label.transform.updateTransform = frozenYTransform;

  let line = new PIXI.Graphics();
  line.lineStyle(1, 0xaaaaaa, 0.25);
  line.moveTo(0, 0);
  line.lineTo(width, 0);
  line.transform.updateTransform = frozenYTransform;

  return [line, label];
}

function buildAutoScalingGrid(container, width, height) {
  const maxXLines = 45;
  const maxYLines = 12;
  const fontSize = 15;
  const gutter = 50;
  let lastBounds = {};

  const xLabels = [];
  const xLines = [];
  for (let i = 0; i < maxXLines; i++) {
    let [line, label] = makeXTickAndLine(fontSize, height);
    xLines.push(line);
    xLabels.push(label);
  }

  const yLabels = [];
  const yLines = [];
  for (let i = 0; i < maxYLines; i++) {
    let [line, label] = makeYTickAndLine(fontSize, width);
    yLines.push(line);
    yLabels.push(label);
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

  function calcBounds(xMin, xMax, yMin, yMax, tickCount) {
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
    // Instead of using lastBounds, it may be faster to compare previous min/max visible x & y
    const minVisibleX = Math.floor((-1 * container.position._x) / container.scale._x);
    const maxVisibleX = minVisibleX + Math.floor(width / container.scale._x);
    const minVisibleY = Math.floor((-1 * container.position._y) / container.scale._y);
    const maxVisibleY = minVisibleY + Math.floor(height / container.scale._y);

    let b = calcBounds(minVisibleX, maxVisibleX, minVisibleY, maxVisibleY, maxYLines);
    if (b.xMin !== lastBounds.xMin || b.step !== lastBounds.step || b.yMin !== lastBounds.yMin) {
      for (let i = 0; i < xLines.length; i++) {
        xLines[i].x = b.xMin + b.step * i;
        xLabels[i].text = `${b.xMin + i * b.step}`;
        xLabels[i].x = b.xMin + b.step * i;
      }

      for (let i = 0; i < yLines.length; i++) {
        yLines[i].y = b.yMin + b.step * i;
        yLabels[i].text = `${b.yMin + i * b.step}`;
        yLabels[i].y = b.yMin + b.step * i;
      }
      lastBounds = b;
    }
  };
}

export { buildAutoScalingGrid };
