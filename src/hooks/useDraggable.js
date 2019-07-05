import * as PIXI from "pixi.js";
import { useEffect, useCallback } from "react";
import useRef from "react-powertools/hooks/useRef";

export default function useDraggable(container, onDrag, width, height) {
  useEffect(
    function makeContainerInteractive() {
      if (container) {
        container.interactive = true;
        container.hitArea = new PIXI.Rectangle(0, 0, width, height);
      }
    },
    [container, width, height]
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
    moveData => {
      const interactionState = interactionStateRef.current;

      if (!interactionState.isDragging || interactionState.isOutside) {
        return;
      }

      const currMouse = moveData.data.global;
      onDrag(currMouse, interactionState.prevMouse);

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
