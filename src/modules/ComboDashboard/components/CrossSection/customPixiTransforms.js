///  These custom versions of PIXI's updateTransform perform calculations in slightly
///  different ways to change how the parent transform affects the local object transform.
///  These transforms are modified versions of an optimized internal PIXI method. While they could be
///  refactored to reduce duplicate code, that would likely reduce their performance.
///  Original method: http://pixijs.download/dev/docs/packages_math_src_Transform.js.html#line119

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
    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;
    lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
    lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    this._currentLocalID = this._localID;
    this._parentID = -1;
  }
  if (this._parentID !== parentTransform._worldID) {
    const pt = parentTransform.worldTransform;
    const wt = this.worldTransform;
    // Divide out the parent scale
    wt.a = (lt.a * pt.a + lt.b * pt.c) / pt.a;
    wt.b = (lt.a * pt.b + lt.b * pt.d) / pt.d;
    wt.c = (lt.c * pt.a + lt.d * pt.c) / pt.a;
    wt.d = (lt.c * pt.b + lt.d * pt.d) / pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    this._parentID = parentTransform._worldID;
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
    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;
    lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
    lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    this._currentLocalID = this._localID;
    this._parentID = -1;
  }
  if (this._parentID !== parentTransform._worldID) {
    const pt = parentTransform.worldTransform;
    const wt = this.worldTransform;
    // Divide out the parent scale
    wt.a = (lt.a * pt.a + lt.b * pt.c) / pt.a;
    wt.b = (lt.a * pt.b + lt.b * pt.d) / pt.d;
    wt.c = (lt.c * pt.a + lt.d * pt.c) / pt.a;
    wt.d = (lt.c * pt.b + lt.d * pt.d) / pt.d;
    // Hold x constant from the local transform
    wt.tx = lt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    this._parentID = parentTransform._worldID;
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
    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;
    lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
    lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    this._currentLocalID = this._localID;
    this._parentID = -1;
  }
  if (this._parentID !== parentTransform._worldID) {
    const pt = parentTransform.worldTransform;
    const wt = this.worldTransform;
    // Divide out the parent scale
    wt.a = (lt.a * pt.a + lt.b * pt.c) / pt.a;
    wt.b = (lt.a * pt.b + lt.b * pt.d) / pt.d;
    wt.c = (lt.c * pt.a + lt.d * pt.c) / pt.a;
    wt.d = (lt.c * pt.b + lt.d * pt.d) / pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    // Hold y constant from the local transform
    wt.ty = lt.ty;
    this._parentID = parentTransform._worldID;
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
    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;
    lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
    lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    this._currentLocalID = this._localID;
    this._parentID = -1;
  }
  if (this._parentID !== parentTransform._worldID) {
    const pt = parentTransform.worldTransform;
    const wt = this.worldTransform;
    // Divide out the parent scale
    wt.a = (lt.a * pt.a + lt.b * pt.c) / pt.a;
    wt.b = (lt.a * pt.b + lt.b * pt.d) / pt.d;
    wt.c = (lt.c * pt.a + lt.d * pt.c) / pt.a;
    wt.d = (lt.c * pt.b + lt.d * pt.d) / pt.d;
    // Hold both x and y constant from the local transform
    wt.tx = lt.tx;
    wt.ty = lt.ty;
    this._parentID = parentTransform._worldID;
    this._worldID++;
  }
}

export { frozenScaleTransform, frozenXTransform, frozenXYTransform, frozenYTransform };
