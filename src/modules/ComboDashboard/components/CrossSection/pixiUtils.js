/**
 * Add mouse and touch events to a PIXI displayObject to enable dragging
 * @param obj The PIXI displayObject
 * @param onMove  Callback to set the new x and y for the object
 */
function subscribeToMoveEvents(obj, onMove, onEnd) {
  let dragging = false;
  obj.interactive = true;
  obj.onMove = onMove || (_ => {});
  obj.dragEnd = onEnd || (_ => {});
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
    if (!dragging) {
      event.stopPropagation();
      this.data = event.data;
      dragging = true;

      // Point relative to the center of the object
      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  function onDragEnd() {
    if (dragging) {
      dragging = false;
      this.data = null;
      this.dragEnd();
    }
  }

  function onDragMove(event) {
    if (dragging) {
      event.stopPropagation();
      const newPosition = this.data.getLocalPosition(this.parent);
      newPosition.x -= this.dragPoint.x;
      newPosition.y -= this.dragPoint.y;
      this.onMove(newPosition);
    }
  }
}

function removeAllChildren(pixiObj) {
  while (pixiObj.children[0]) {
    pixiObj.children[0].destroy();
  }
}
export { subscribeToMoveEvents, removeAllChildren };
