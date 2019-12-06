import useRef from "react-powertools/hooks/useRef";
import { useCallback, useEffect } from "react";
import * as PIXI from "pixi.js";
import useDraggable from "./useDraggable";

export const globalMouse = { x: 0, y: 0 };

export function getZoomRate(e) {
  const isControlKey = e.ctrlKey;
  const isShiftKey = e.shiftKey;
  return isControlKey && isShiftKey ? 0.3 : isControlKey ? 0.15 : isShiftKey ? 0.06 : 0.03;
}

// enable mouse wheel and drag
export default function useViewport({
  renderer,
  stage,
  width,
  height,
  updateView,
  view,
  zoomXScale,
  zoomYScale,
  isXScalingValid = () => 1,
  isYScalingValid = () => 1
}) {
  const interactionManagerRef = useRef(() => new PIXI.interaction.InteractionManager(renderer));
  const {
    current: { viewportContainer: viewport }
  } = useRef(() => {
    const viewportContainer = new PIXI.Container();
    viewportContainer.sortableChildren = true;
    return {
      viewportContainer
    };
  });

  const onWheel = useCallback(
    e => {
      e.preventDefault();
      interactionManagerRef.current.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

      const zoomRate = getZoomRate(e);
      // sign of deltaY (-1,0,1) determines zoom in or out
      const factor = 1 - Math.sign(e.deltaY) * zoomRate;

      updateView(prev => {
        const newValue = {
          ...prev
        };

        const newX = globalMouse.x - (globalMouse.x - prev.x) * factor;
        const newScale = prev.xScale * factor;
        if (zoomXScale && isXScalingValid(newScale, newX, e)) {
          newValue.x = newX;
          newValue.xScale = newScale;
        }
        const newY = globalMouse.y - (globalMouse.y - prev.y) * factor;
        const newYScale = prev.yScale * factor;
        if (zoomYScale && isYScalingValid(newY, newYScale, e)) {
          newValue.y = newY;
          newValue.yScale = newYScale;
        }
        return newValue;
      });
    },
    [updateView, zoomXScale, zoomYScale, isXScalingValid, isYScalingValid]
  );

  const onDrag = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;

      interactionManagerRef.current.mapPositionToPoint(
        globalMouse,
        event.data.originalEvent.clientX,
        event.data.originalEvent.clientY
      );
      updateView(prev => {
        const newX = Number(prev.x) + (currMouse.x - prevMouse.x);
        const newY = Number(prev.y) + (currMouse.y - prevMouse.y);
        return {
          ...prev,
          y: zoomYScale && isYScalingValid(prev.yScale, newY) ? newY : prev.y,
          x: zoomXScale && isXScalingValid(prev.xScale, newX) ? newX : prev.x
        };
      });
    },
    [updateView, isXScalingValid, zoomYScale, zoomXScale, isYScalingValid]
  );

  const getContainer = useCallback(() => stage, [stage]);

  useDraggable({
    getContainer,
    root: stage,
    onDrag,
    x: 0,
    y: 0,
    width,
    height
  });

  useEffect(
    function enableMouseInteractions() {
      renderer.view.addEventListener("wheel", onWheel, false);

      return () => {
        renderer.view.removeEventListener("wheel", onWheel, false);
      };
    },
    [renderer, onWheel, stage]
  );

  useEffect(() => {
    if (stage) {
      stage.addChild(viewport);
    }

    return () => {
      if (viewport && stage) {
        stage.removeChild(viewport);
        viewport.destroy({ children: true });
      }
    };
  }, [stage, viewport]);

  useEffect(
    function updateViewport() {
      viewport.position = new PIXI.Point(view.x, view.y);
      viewport.scale.x = view.xScale;
      viewport.scale.y = view.yScale;
    },
    [view, viewport]
  );

  return viewport;
}
