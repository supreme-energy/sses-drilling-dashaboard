import * as PIXI from "pixi.js";
import { useEffect, useCallback } from "react";
import useRef from "react-powertools/hooks/useRef";

const IDENTITY = d => d;
export default function useDraggable({
  getContainer,
  root,
  onDrag,
  x,
  y,
  width,
  height,
  onOver = IDENTITY,
  onDragEnd = IDENTITY,
  canvas,
  cursor
}) {
  useEffect(
    function makeContainerInteractive() {
      const container = getContainer();
      if (container) {
        container.interactive = true;
        container.hitArea = new PIXI.Rectangle(x, y, width, height);
      }
    },
    [getContainer, width, height, x, y]
  );

  const interactionStateRef = useRef(() => {
    return {
      isDragging: false,
      isOutside: false,
      prevMouse: {},
      onMouseMove: event => {
        const interactionState = interactionStateRef.current;
        if (!interactionState.isDragging) {
          return;
        }
        const currMouse = event.data.global;

        event.stopPropagation();

        interactionStateRef.current.onDrag(event, interactionState.prevMouse);
        Object.assign(interactionState.prevMouse, currMouse);
      }
    };
  });

  // we save this on interactionState because we can't provide them as  input to hooks, if they change while
  // drag opertion is pending the interaction will be broken

  interactionStateRef.current.onDrag = onDrag;
  interactionStateRef.current.onDragEnd = onDragEnd;

  const onMouseDown = useCallback(
    function(e) {
      const container = getContainer();
      const interactionState = interactionStateRef.current;
      const pos = e.data.global;
      Object.assign(interactionState.prevMouse, pos);
      interactionState.isDragging = true;
      container.on("mousemove", interactionState.onMouseMove);
    },
    [getContainer]
  );

  const onMouseOut = useCallback(() => {
    interactionStateRef.current.isOutside = true;
    if (canvas && !interactionStateRef.current.isDragging) {
      canvas.style.cursor = "default";
    }
  }, [canvas]);
  const onMouseOver = useCallback(
    e => {
      interactionStateRef.current.isOutside = false;

      if (canvas) {
        canvas.style.cursor = cursor;
      }
      onOver(e);
    },
    [onOver, canvas, cursor]
  );

  const onMouseUp = useCallback(
    e => {
      const container = getContainer();
      const interactionState = interactionStateRef.current;
      interactionState.isDragging = false;
      container.off("mousemove", interactionState.onMouseMove);
      interactionState.onDragEnd(e);
      if (canvas) {
        canvas.style.cursor = "default";
      }
    },
    [getContainer, canvas]
  );

  useEffect(
    function enableMouseInteractions() {
      const container = getContainer();
      if (container) {
        container.on("mouseout", onMouseOut);

        container.on("mouseover", onMouseOver);
        container.on("mousedown", onMouseDown);
        container.on("mouseup", onMouseUp);
        container.on("mouseupoutside", onMouseUp);
      }

      return () => {
        if (container) {
          container.off("mouseout", onMouseOut);
          container.off("mouseover", onMouseOver);
          container.off("mousedown", onMouseDown);
          container.off("mouseup", onMouseUp);
          container.off("mouseupoutside", onMouseUp);
        }
      };
    },
    [getContainer, onMouseDown, onMouseOut, onMouseOver, onMouseUp, canvas]
  );
}
