import * as PIXI from "pixi.js";
import { useEffect } from "react";
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
        container.__draggable = true;
      }
    },
    [getContainer, width, height, x, y]
  );

  const interactionStateRef = useRef(() => {
    return {
      isDragging: false,
      isOutside: false,
      prevMouse: {},
      initialMouse: {},
      onMouseMove: event => {
        const interactionState = interactionStateRef.current;
        if (!interactionState.isDragging) {
          return;
        }
        const currMouse = event.data.global;

        event.stopPropagation();

        interactionStateRef.current.onDrag(event, interactionState.prevMouse, interactionState.initialMouse);
        Object.assign(interactionState.prevMouse, currMouse);
      }
    };
  });

  // we save this on interactionState because we can't provide them as  input to hooks, if they change while
  // drag opertion is pending the interaction will be broken

  interactionStateRef.current.onDrag = onDrag;
  interactionStateRef.current.onDragEnd = onDragEnd;

  useEffect(
    function enableMouseInteractions() {
      const onMouseDown = e => {
        const container = getContainer();
        const interactionState = interactionStateRef.current;
        const pos = e.data.global;
        Object.assign(interactionState.prevMouse, pos);
        Object.assign(interactionState.initialMouse, pos);
        interactionState.isDragging = true;
        container.on("mousemove", interactionState.onMouseMove);
      };

      const onMouseOut = e => {
        interactionStateRef.current.isOutside = true;

        if (canvas && !interactionStateRef.current.isDragging && !(e.target && e.target.__draggable)) {
          canvas.style.cursor = "default";
        }
      };
      const onMouseOver = e => {
        interactionStateRef.current.isOutside = false;
        if (canvas) {
          canvas.style.cursor = cursor;
        }
        onOver(e);
      };

      const onMouseUp = e => {
        const container = getContainer();
        const interactionState = interactionStateRef.current;
        if (interactionState.isDragging) {
          interactionState.isDragging = false;
          container.off("mousemove", interactionState.onMouseMove);
          interactionState.onDragEnd(e);
          if (canvas) {
            canvas.style.cursor = "default";
          }
        }
      };
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
    [getContainer, canvas, onOver, cursor]
  );
}
