import memoizeOne from "memoize-one";
import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform, frozenYTransform } from "./customPixiTransforms";

export function defaultMakeXTickAndLine(fontSize) {
  const label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(0.5, 0.5);
  label.rotation = Math.PI / 2;
  label.transform.updateTransform = frozenXTransform;

  // Using GraphicsGeometry may offer better performance here?
  const line = new PIXI.Graphics();
  line.lineStyle(1, 0xaaaaaa, 0.25);
  line.moveTo(0, 0);
  line.lineTo(0, 4096);
  line.transform.updateTransform = frozenXTransform;

  return [line, label];
}
export function defaultMakeYTickAndLine(fontSize) {
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
  line.lineTo(8192, 0);
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
 * @param options    Optional configuration parameters
 * @returns {updateGrid}  The function to update the gridlines
 */
function drawGrid(container, options = {}) {
  let {
    gutter = 50,
    xAxisOrientation = "bottom",
    makeXTickAndLine = defaultMakeXTickAndLine,
    makeYTickAndLine = defaultMakeYTickAndLine,
    maxXLines = 45,
    maxYLines = 12
  } = options;
  const fontSize = 15;
  let lastBounds = {};

  const xLabels = [];
  const xLines = [];
  for (let i = 0; i < maxXLines; i++) {
    let [line, label] = makeXTickAndLine(fontSize, i);
    xLines.push(line);
    xLabels.push(label);
    if (xAxisOrientation === "top") {
      label.y = 30;
    }
  }

  const yLabels = [];
  const yLines = [];
  for (let i = 0; i < maxYLines; i++) {
    let [line, label] = makeYTickAndLine(fontSize);
    yLines.push(line);
    yLabels.push(label);
  }
  // Add the elements of the grid in the correct order
  // Lines are first
  xLines.forEach(l => container.addChild(l));
  yLines.forEach(l => container.addChild(l));

  // White background behind tick labels
  const bgx = new PIXI.Graphics();
  bgx.transform.updateTransform = frozenXYTransform;
  container.addChild(bgx);

  const bgy = new PIXI.Graphics();
  // bgy.beginFill(0xffffff);
  // bgy.lineStyle(0);
  // bgy.drawRect(0, xAxisOrientation === "top" ? 0 : height - gutter, width, gutter);
  bgy.transform.updateTransform = frozenXYTransform;
  container.addChild(bgy);

  // Tick labels go on top of the white backgrounds
  xLabels.forEach(l => container.addChild(l));
  yLabels.forEach(l => container.addChild(l));

  // Corner to hide overlapping tick labels
  const corner = new PIXI.Graphics();
  // corner.beginFill(0xffffff);
  // corner.drawRect(0, xAxisOrientation === "top" ? 0 : height - gutter, gutter, gutter);
  corner.transform.updateTransform = frozenXYTransform;
  container.addChild(corner);

  function calcBounds(yScale, y, x, xScale, width, height, xMaxLines, yMaxLines) {
    const xMin = Math.floor((-1 * x) / xScale);
    const xMax = xMin + Math.floor(width / xScale);
    const yMin = Math.floor((-1 * y) / yScale);
    const yMax = yMin + Math.floor(height / yScale);

    const yRoughStep = (yMax - yMin) / (yMaxLines - 1);
    const xRoughStep = (xMax - xMin) / (xMaxLines - 1);

    const goodSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
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

  const memoCalcBounds = memoizeOne(calcBounds);

  return function updateGrid(props, options = {}) {
    // Sometimes transform is undefined and we need it for position/scale
    if (!container.transform) return;
    const cwt = container.transform.worldTransform;
    const { width, height, view } = props;
    const { maxXTicks = maxXLines, maxYTicks = maxYLines } = options;
    const t = view || { x: cwt.tx, y: cwt.ty, xScale: cwt.a, yScale: cwt.d };

    let bounds = memoCalcBounds(t.yScale, t.y, t.x, t.xScale, width, height, maxXTicks, maxYTicks);

    if (bounds !== lastBounds) {
      const xAxisAnchor = xAxisOrientation === "top" ? gutter : height;
      // Redraw the background as width or height may have changed
      bgx.clear().beginFill(0xffffff);
      bgx.drawRect(0, 0, gutter, height);
      bgy.clear().beginFill(0xffffff);
      bgy.drawRect(0, xAxisAnchor - gutter, width, gutter);
      corner.clear().beginFill(0xffffff);
      corner.drawRect(0, xAxisAnchor - gutter, gutter, gutter);

      for (let i = 0; i < xLines.length; i++) {
        let pos = bounds.xMin + bounds.xStep * i;
        xLines[i].x = pos;
        xLabels[i].x = pos;
        xLabels[i].y = xAxisAnchor - gutter / 2;
        xLabels[i].text = `${pos}`;
      }

      for (let i = 0; i < yLines.length; i++) {
        let pos = bounds.yMin + bounds.yStep * i;
        yLines[i].y = pos;
        yLabels[i].y = pos;
        yLabels[i].text = `${pos}`;
      }
      lastBounds = bounds;
    }
  };
}

export { drawGrid };
