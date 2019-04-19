import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenYTransform, frozenXYTransform, frozenXTransform } from "./customPixiTransforms";

/**
 * Add mouse and touch events to a PIXI displayObject to enable dragging
 * @param obj The PIXI displayObject
 * @param cb  Callback to set the new x and y for the object
 */
function subscribeToMoveEvents(obj, cb) {
  obj.interactive = true;
  obj.cb = cb || (_ => {});
  obj
    .on("mousedown", onDragStart)
    .on("touchstart", onDragStart)
    .on("mouseup", onDragEnd)
    .on("mouseupoutside", onDragEnd)
    .on("touchend", onDragEnd)
    .on("touchendoutside", onDragEnd)
    .on("mousemove", onDragMove)
    .on("touchmove", onDragMove);

  function onDragStart(event) {
    if (!this.dragging) {
      event.stopPropagation();
      this.data = event.data;
      this.dragging = true;

      // Point relative to the center of the object
      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  function onDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.data = null;
    }
  }

  function onDragMove(event) {
    if (this.dragging) {
      event.stopPropagation();
      const newPosition = this.data.getLocalPosition(this.parent);
      newPosition.x = newPosition.x - this.dragPoint.x;
      newPosition.y = newPosition.y - this.dragPoint.y;
      this.cb(newPosition);
    }
  }
}

/**
 * Add grid lines to a PIXI.Container
 * @param container The PIXI container to add gridlines to
 * @param options   Options for grid intervals, labels, etc
 */
function addGridlines(container, options = {}) {
  let w = container.width;
  let h = container.height;
  let xHide = options.xHide || false;
  let xInterval = options.xInterval || 100;
  let yHide = options.yHide || false;
  let yInterval = options.yInterval || 100;

  // Generate lines for x axis
  if (!xHide) {
    for (let i = 0; i < w; i += xInterval) {
      let label = new PIXI.Text(i, {
        fill: "#aaa",
        fontSize: 20
      });
      label.anchor.set(0.5, 0);
      label.x = i;
      label.y = h;
      container.addChild(label);

      let line = new PIXI.Graphics();
      line.lineStyle(2, 0xaaaaaa, 0.3);
      line.moveTo(i, 0);
      line.lineTo(i, h);
      container.addChild(line);
    }
  }

  // Generate lines for y axis
  if (!yHide) {
    for (let i = 0; i < h; i += yInterval) {
      let label = new PIXI.Text(i, {
        fill: "#aaa",
        fontSize: 20
      });
      label.anchor.set(1, 0.5);
      label.x = 0;
      label.y = i;
      container.addChild(label);

      let line = new PIXI.Graphics();
      line.lineStyle(2, 0xaaaaaa, 0.3);
      line.moveTo(0, i);
      line.lineTo(w, i);
      container.addChild(line);
    }
  }
}

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 * @param formations The formation data from the API
 */
function addDemoFormations(container, formations) {
  const calcXY = p => [Number(p.vs), Number(p.tot) + Number(p.thickness)];
  for (let f of formations) {
    f.xyCoords = f.data.map(point => calcXY(point));
  }
  for (let i = 0; i < formations.length - 1; i++) {
    const { xyCoords, bg_color, bg_percent } = formations[i];
    let line = new PIXI.Graphics();
    let poly = new PIXI.Graphics();
    poly.lineStyle(0);
    line.lineStyle(4, Number(`0x${bg_color}`), 1); //Number(formations[i].bg_percent));
    line.moveTo(...xyCoords[0]);
    for (let i = 1; i < xyCoords.length; i++) {
      line.lineTo(...xyCoords[i]);
    }
    container.addChild(line);
    poly.beginFill(Number(`0x${bg_color}`), Number(bg_percent));
    poly.drawPolygon(
      xyCoords
        .reverse()
        .flat()
        .concat(formations[i + 1].xyCoords)
        .flat()
    );
    poly.closePath();
    container.addChild(poly);
  }
}

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
    const xRange = xMax - xMin;
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

export { subscribeToMoveEvents, addGridlines, addDemoFormations, buildAutoScalingGrid };
