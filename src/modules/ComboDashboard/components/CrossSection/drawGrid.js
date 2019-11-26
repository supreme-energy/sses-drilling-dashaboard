import memoizeOne from "memoize-one";
import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform, frozenYTransform } from "./customPixiTransforms";

export function defaultMakeXTickAndLine(fontSize) {
  const label = new PIXI.Text("", {
    fill: "#999",
    fontSize: fontSize
  });
  label.anchor.set(-0.2, 0.5);
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
  const {
    gutter = 50,
    xAxisOrientation = "bottom",
    showXAxis = true,
    showYAxis = true,
    makeXTickAndLine = defaultMakeXTickAndLine,
    makeYTickAndLine = defaultMakeYTickAndLine,
    maxXLines = 45,
    maxYLines = 12,
    fontSize = 15
  } = options;
  let { gutterLeft = gutter, gutterBottom = gutter } = options;
  const lineZIndex = 0;
  const labelBGZIndex = 5;
  const labelZIndex = 10;
  const cornerZIndex = 15;
  const gridContainer = container.addChild(new PIXI.Container());
  gridContainer.sortableChildren = true;

  let lastBounds = {};

  const xLabels = [];
  const xLines = [];

  const yLabels = [];
  const yLines = [];

  // White background behind tick labels
  let bgx, bgy;

  if (showYAxis) {
    bgx = new PIXI.Graphics();
    bgx.transform.updateTransform = frozenXYTransform;
    bgx.zIndex = labelBGZIndex;
    gridContainer.addChild(bgx);
  }

  if (showXAxis) {
    bgy = new PIXI.Graphics();
    bgy.transform.updateTransform = frozenXYTransform;
    bgy.zIndex = labelBGZIndex;
    gridContainer.addChild(bgy);
  }

  // Corner to hide overlapping tick labels
  let corner;

  if (showXAxis) {
    corner = new PIXI.Graphics();
    corner.transform.updateTransform = frozenXYTransform;
    corner.zIndex = cornerZIndex;
    gridContainer.addChild(corner);
  }

  const memoCalcBounds = memoizeOne((yScale, y, x, xScale, width, height, xMaxLines, yMaxLines) => {
    const xMin = Math.floor((-1 * x) / xScale);
    const xMax = xMin + Math.floor(width / xScale);
    const yMin = Math.floor((-1 * y) / yScale);
    const yMax = yMin + Math.floor(height / yScale);

    const yRoughStep = (yMax - yMin) / yMaxLines;
    const xRoughStep = (xMax - xMin) / xMaxLines;

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
  });

  function addXTickAndLine(i) {
    const [line, label] = makeXTickAndLine(fontSize, i);
    line.zIndex = lineZIndex;
    label.zIndex = labelZIndex;

    xLines[i] = gridContainer.addChild(line);
    xLabels[i] = gridContainer.addChild(label);

    if (xAxisOrientation === "top") {
      label.y = 30;
    }
  }
  function addYTickAndLine(i) {
    const [line, label] = makeYTickAndLine(fontSize, i);
    line.zIndex = lineZIndex;
    label.zIndex = labelZIndex;

    yLines[i] = gridContainer.addChild(line);
    yLabels[i] = gridContainer.addChild(label);
  }

  return function updateGrid(props, options = {}) {
    // Sometimes transform is undefined and we need it for position/scale
    if (!container.transform) return;
    const cwt = container.transform.worldTransform;
    const { width, height, view, yAxisDirection = 1 } = props;
    const { maxXTicks = maxXLines, maxYTicks = maxYLines } = options;
    const t = view || { x: cwt.tx, y: cwt.ty, xScale: cwt.a, yScale: cwt.d };
    const bounds = memoCalcBounds(t.yScale, t.y, t.x, t.xScale, width, height, maxXTicks, maxYTicks);

    if (bounds !== lastBounds) {
      const xAxisAnchor = xAxisOrientation === "top" ? gutterBottom : height;
      // Redraw the background as width or height may have changed
      if (bgx) {
        bgx.clear().beginFill(0xffffff);
        bgx.drawRect(0, 0, gutterLeft, height);
      }

      if (bgy) {
        bgy.clear().beginFill(0xffffff);
        bgy.drawRect(0, xAxisAnchor - gutterBottom, width, gutterBottom);
      }

      if (corner && showYAxis) {
        corner.clear().beginFill(0xffffff);
        corner.drawRect(0, xAxisAnchor - gutterBottom, gutterLeft, gutterBottom);
      }

      xLines.forEach(l => (l.visible = false));
      xLabels.forEach(l => (l.visible = false));
      for (let i = 0; bounds.xMin + bounds.xStep * i < bounds.xMax * 1.1; i++) {
        const pos = bounds.xMin + bounds.xStep * i;
        if (!xLines[i]) {
          addXTickAndLine(i);
        }
        xLines[i].x = pos;
        xLines[i].visible = true;
        if (showXAxis) {
          xLabels[i].x = pos;
          xLabels[i].y = xAxisAnchor - gutterBottom;
          xLabels[i].text = `${pos}`;
          xLabels[i].visible = true;
        }
      }

      yLines.forEach(l => (l.visible = false));
      yLabels.forEach(l => (l.visible = false));

      for (let i = 0; bounds.yMin + bounds.yStep * i < bounds.yMax * 1.1; i++) {
        const pos = bounds.yMin + bounds.yStep * i;
        if (!yLines[i]) {
          addYTickAndLine(i);
        }
        yLines[i].y = pos;
        yLines[i].visible = true;

        if (showYAxis) {
          yLabels[i].y = pos;
          yLabels[i].text = `${yAxisDirection * pos}`;
          yLabels[i].visible = true;
        }
      }
      lastBounds = bounds;
    }
  };
}

export { drawGrid };
