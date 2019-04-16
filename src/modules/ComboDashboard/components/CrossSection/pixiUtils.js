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

/**
 * Transform function that does not affect an object's scale when transformed by
 * the parent object.  Allows for an object to track position with other objects,
 * but remain the same size.
 * Updates the values of the object and applies the parent's transform.
 *
 * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
 */
function customTransform(parentTransform) {
  var lt = this.localTransform;

  this._cx = Math.cos(this._rotation + this.skew._y);
  this._sx = Math.sin(this._rotation + this.skew._y);
  this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
  this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2

  if (this._localID !== this._currentLocalID) {
    // get the matrix values of the displayobject based on its transform properties..
    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;

    lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
    lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    this._currentLocalID = this._localID;

    // force an update..
    this._parentID = -1;
  }

  if (this._parentID !== parentTransform._worldID) {
    // concat the parent matrix with the objects transform.
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;

    wt.a = lt.a * pt.a + lt.b * pt.c;
    wt.b = lt.a * pt.b + lt.b * pt.d;
    wt.c = lt.c * pt.a + lt.d * pt.c;
    wt.d = lt.c * pt.b + lt.d * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._parentID = parentTransform._worldID;

    // update the id of the transform..
    this._worldID++;
  }
}

export { subscribeToMoveEvents, addGridlines, addDemoFormations, customTransform };
