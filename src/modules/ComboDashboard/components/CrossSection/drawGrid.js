import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform, frozenYTransform } from "./customPixiTransforms";

function makeXTickAndLine(fontSize, height) {
  const label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(1, 0.5);
  label.rotation = Math.PI / 2;
  label.y = height;
  label.transform.updateTransform = frozenXTransform;

  // Using GraphicsGeometry may offer better performance here?
  const line = new PIXI.Graphics();
  line.lineStyle(1, 0xaaaaaa, 0.25);
  line.moveTo(0, 0);
  line.lineTo(0, height);
  line.transform.updateTransform = frozenXTransform;

  return [line, label];
}
function makeYTickAndLine(fontSize, width) {
  const label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(0, 0.5);
  label.x = 5;
  label.transform.updateTransform = frozenYTransform;

  const line = new PIXI.Graphics();
  line.lineStyle(1, 0xaaaaaa, 0.25);
  line.moveTo(0, 0);
  line.lineTo(width, 0);
  line.transform.updateTransform = frozenYTransform;

  return [line, label];
}

/**
 * Creates gridlines and labels on the given container and returns a function
 * for updating the grid during each PIXI tick.  Provided the update is called
 * during a tick, the grid will automatically scale as the user zooms in and out.
 * Additionally, gridlines are not drawn for the entire container but only about
 * as many as are visible.
 *
 * @param container  The PIXI Container to which the grid should be added
 * @param width  The canvas width
 * @param height  The canvas height
 * @returns {updateGrid}  The function to update the gridlines
 */
function drawGrid(container, width, height, gutter = 50, xAxisOrientation) {
  const maxXLines = 45;
  const maxYLines = 12;
  const fontSize = 15;
  let lastBounds = {};

  const xLabels = [];
  const xLines = [];
  for (let i = 0; i < maxXLines; i++) {
    let [line, label] = makeXTickAndLine(fontSize, height);
    xLines.push(line);
    xLabels.push(label);
    if (xAxisOrientation === "top") {
      label.y = 30;
    }
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
  const bgx = new PIXI.Graphics();
  bgx.beginFill(0xffffff);
  bgx.lineStyle(0);
  bgx.drawRect(0, 0, gutter, height);
  bgx.transform.updateTransform = frozenXYTransform;
  container.addChild(bgx);

  const bgy = new PIXI.Graphics();
  bgy.beginFill(0xffffff);
  bgy.lineStyle(0);
  bgy.drawRect(0, xAxisOrientation === "top" ? 0 : height - gutter, width, gutter);
  bgy.transform.updateTransform = frozenXYTransform;
  container.addChild(bgy);

  // Tick labels go on top of the white backgrounds
  xLabels.forEach(l => container.addChild(l));
  yLabels.forEach(l => container.addChild(l));

  // Corner to hide overlapping tick labels
  const corner = new PIXI.Graphics();
  corner.beginFill(0xffffff);
  corner.drawRect(0, xAxisOrientation === "top" ? 0 : height - gutter, gutter, gutter);
  corner.transform.updateTransform = frozenXYTransform;
  container.addChild(corner);

  function calcBounds(xMin, xMax, yMin, yMax, tickCount) {
    const yRange = yMax - yMin;
    const yRoughStep = yRange / (tickCount - 1);
    const xRange = xMax - xMin;
    const xRoughStep = xRange / (tickCount - 1);

    const goodSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    const yStep = goodSteps.find(s => s >= yRoughStep);
    const xStep = goodSteps.find(s => s >= xRoughStep);

    return {
      xMin: Math.floor(xMin / xStep) * xStep,
      xMax: Math.ceil(xMax / xStep) * xStep,
      xStep,
      yStep,
      yMin: Math.floor(yMin / yStep) * yStep,
      yMax: Math.ceil(yMax / yStep) * yStep
    };
  }

  return function updateGrid(view) {
    // Sometimes transform is undefined and we need it for position/scale
    if (!container.transform) return;
    const cwt = container.transform.worldTransform;
    const t = view || { x: cwt.tx, y: cwt.ty, xScale: cwt.a, yScale: cwt.d };
    // Instead of using lastBounds, it may be faster to compare previous min/max visible x & y
    const minVisibleX = Math.floor((-1 * t.x) / t.xScale);
    const maxVisibleX = minVisibleX + Math.floor(width / t.xScale);
    const minVisibleY = Math.floor((-1 * t.y) / t.yScale);
    const maxVisibleY = minVisibleY + Math.floor(height / t.yScale);

    // Possible improvement: only recalculate step if the x or y range has changed
    const b = calcBounds(minVisibleX, maxVisibleX, minVisibleY, maxVisibleY, maxYLines);

    if (
      b.xMin !== lastBounds.xMin ||
      b.xStep !== lastBounds.xStep ||
      b.yStep !== lastBounds.yStep ||
      b.yMin !== lastBounds.yMin
    ) {
      for (let i = 0; i < xLines.length; i++) {
        let pos = b.xMin + b.xStep * i;
        xLines[i].x = pos;
        xLabels[i].x = pos;
        xLabels[i].text = `${pos}`;
      }

      for (let i = 0; i < yLines.length; i++) {
        let pos = b.yMin + b.yStep * i;
        yLines[i].y = pos;
        yLabels[i].y = pos;
        yLabels[i].text = `${pos}`;
      }
      lastBounds = b;
    }
  };
}

export { drawGrid };
