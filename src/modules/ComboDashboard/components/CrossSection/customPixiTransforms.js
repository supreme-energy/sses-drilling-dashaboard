/**
 * Transform function that does not affect an object's scale when transformed by
 * the parent object.  Allows for an object to track position with other objects,
 * but remain the same size.
 * Updates the values of the object and applies the parent's transform.
 *
 * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
 */
function frozenScaleTransform(parentTransform) {
  const lt = this.localTransform;
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
    const pt = parentTransform.worldTransform;
    const ps = parentTransform.scale;
    const wt = this.worldTransform;
    wt.a = (lt.a * pt.a) / ps.x + lt.b * pt.c;
    wt.b = lt.a * pt.b + (lt.b * pt.d) / ps.y;
    wt.c = (lt.c * pt.a) / ps.x + lt.d * pt.c;
    wt.d = lt.c * pt.b + (lt.d * pt.d) / ps.y;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    this._parentID = parentTransform._worldID;
    // update the id of the transform..
    this._worldID++;
  }
}

/**
 * This transform has the following effects:
 *   Scale is unaffected by the parent scale
 *   Translate y is not affected by the parent
 * @param parentTransform
 */
function frozenYTransform(parentTransform) {
  const lt = this.localTransform;
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
    const pt = parentTransform.worldTransform;
    const ps = parentTransform.scale;
    const wt = this.worldTransform;
    wt.a = (lt.a * pt.a) / ps.x + lt.b * pt.c;
    wt.b = lt.a * pt.b + (lt.b * pt.d) / ps.y;
    wt.c = (lt.c * pt.a) / ps.x + lt.d * pt.c;
    wt.d = lt.c * pt.b + (lt.d * pt.d) / ps.y;
    // wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.tx = lt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    this._parentID = parentTransform._worldID;
    // update the id of the transform..
    this._worldID++;
  }
}
/**
 * This transform has the following effects:
 *   Scale is unaffected by the parent scale
 *   Translate x is not affected by the parent
 * @param parentTransform
 */
function frozenXTransform(parentTransform) {
  const lt = this.localTransform;
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
    const pt = parentTransform.worldTransform;
    const ps = parentTransform.scale;
    const wt = this.worldTransform;
    wt.a = (lt.a * pt.a) / ps.x + lt.b * pt.c;
    wt.b = lt.a * pt.b + (lt.b * pt.d) / ps.y;
    wt.c = (lt.c * pt.a) / ps.x + lt.d * pt.c;
    wt.d = lt.c * pt.b + (lt.d * pt.d) / ps.y;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    // wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    wt.ty = lt.ty;
    this._parentID = parentTransform._worldID;
    // update the id of the transform..
    this._worldID++;
  }
}
/**
 * This transform has the following effects:
 *   Scale is unaffected by the parent scale
 *   Translate x is not affected by the parent
 *   Translate y is not affected by the parent
 * @param parentTransform
 */
function frozenXYTransform(parentTransform) {
  const lt = this.localTransform;
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
    const pt = parentTransform.worldTransform;
    const ps = parentTransform.scale;
    const wt = this.worldTransform;
    wt.a = (lt.a * pt.a) / ps.x + lt.b * pt.c;
    wt.b = lt.a * pt.b + (lt.b * pt.d) / ps.y;
    wt.c = (lt.c * pt.a) / ps.x + lt.d * pt.c;
    wt.d = lt.c * pt.b + (lt.d * pt.d) / ps.y;
    // wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    // wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    wt.ty = lt.ty;
    this._parentID = parentTransform._worldID;
    // update the id of the transform..
    this._worldID++;
  }
}

export { frozenScaleTransform, frozenXTransform, frozenXYTransform, frozenYTransform };
