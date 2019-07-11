import * as PIXI from "pixi.js";
import { useEffect, useCallback } from "react";
import useRef from "react-powertools/hooks/useRef";

export default function useDraggable(container, onDrag, x, y, width, height) {
  useEffect(
    function makeContainerInteractive() {
      if (container) {
        container.interactive = true;
        container.hitArea = new PIXI.Rectangle(x, y, width, height);
      }
    },
    [container, width, height, x, y]
  );

  const interactionStateRef = useRef({
    isDragging: false,
    isOutside: false,
    prevMouse: {}
  });

  const onMouseDown = useCallback(function(e) {
    e.stopPropagation();
    const interactionState = interactionStateRef.current;
    const pos = e.data.global;
    Object.assign(interactionState.prevMouse, pos);
    interactionState.isDragging = true;
  }, []);

  const onMouseMove = useCallback(
    event => {
      const interactionState = interactionStateRef.current;

      if (!interactionState.isDragging) {
        return;
      }
      const currMouse = event.data.global;

      // event.stopPropagation();

      onDrag(event, interactionState.prevMouse);
      Object.assign(interactionState.prevMouse, currMouse);
    },
    [onDrag]
  );

  const onMouseOut = useCallback(() => (interactionStateRef.current.isOutside = true), []);
  const onMouseOver = useCallback(() => (interactionStateRef.current.isOutside = false), []);
  const onMouseUp = useCallback(() => (interactionStateRef.current.isDragging = false), []);

  useEffect(
    function enableMouseInteractions() {
      if (container) {
        container.on("pointerdown", onMouseDown);
        container.on("mousemove", onMouseMove);
        container.on("mouseout", onMouseOut);
        container.on("mouseover", onMouseOver);
        container.on("pointerup", onMouseUp);
      }

      return () => {
        if (container) {
          container.off("pointerdown", onMouseDown);
          container.off("mousemove", onMouseMove);
          container.off("mouseout", onMouseOut);
          container.off("mouseover", onMouseOver);
          container.off("pointerup", onMouseUp);
        }
      };
    },
    [container, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp]
  );
}
