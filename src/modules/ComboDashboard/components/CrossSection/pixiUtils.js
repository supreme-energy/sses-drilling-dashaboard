import * as PIXI from "pixi.js";

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
  let xInterval = options.xInterval || 50;
  let yHide = options.yHide || false;
  let yInterval = options.yInterval || 50;

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
 * Add randomly generated formation layers
 * @param container The PIXI container that will get the formations
 * @param worldWidth The width of the formations generated
 * @param worldHeight the height of the formations generated
 */
function addDemoFormations(container, worldWidth, worldHeight) {
  const layerColors = [0xd8d8d8, 0xcac297, 0xb3b59a, 0xd8d8b3, 0xb3b59a, 0xcdd8d8];
  const topPolyLine = [0, 0, worldWidth, 0].reverse();
  const bottomPolyLIne = [worldWidth, worldHeight, 0, worldHeight];
  let prevPath = topPolyLine;
  for (let layer = 0; layer < layerColors.length; layer++) {
    let nextPath = [];
    let anchor = ((layer + 1) * worldHeight) / layerColors.length;

    let horizontalPoints = worldWidth / 100;
    for (let i = horizontalPoints; i >= 0; i--) {
      let p = [(i * worldWidth) / horizontalPoints, anchor + Math.random() * (worldHeight / (layerColors.length * 3))];
      nextPath.push(p);
    }

    if (layer === layerColors.length - 1) nextPath = bottomPolyLIne;

    let poly = new PIXI.Graphics();
    poly.lineStyle(0);
    poly.beginFill(layerColors[layer], 1);
    poly.drawPolygon(
      prevPath
        .reverse()
        .flat()
        .concat(nextPath.flat())
    );

    poly.closePath();
    container.addChild(poly);

    prevPath = nextPath;
  }
}

export { subscribeToMoveEvents, addGridlines, addDemoFormations };
