import useRef from "react-powertools/hooks/useRef";
import { useCallback, useEffect } from "react";
import * as PIXI from "pixi.js";
import useDraggable from "./useDraggable";

const globalMouse = { x: 0, y: 0 };

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
  isXScalingValid
}) {
  const interactionManagerRef = useRef(() => new PIXI.interaction.InteractionManager(renderer));
  const viewportRef = useRef(() => {
    const viewportContainer = new PIXI.Container();
    viewportContainer.sortableChildren = true;
    return viewportContainer;
  });

  const onWheel = useCallback(
    e => {
      e.preventDefault();
      interactionManagerRef.current.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

      // sign of deltaY (-1,0,1) determines zoom in or out
      const factor = 1 - Math.sign(e.deltaY) * 0.03;

      updateView(prev => {
        const newValue = {
          ...prev
        };

        const newX = globalMouse.x - (globalMouse.x - prev.x) * factor;
        const newScale = prev.xScale * factor;
        if (zoomXScale && isXScalingValid(newScale, newX)) {
          newValue.x = newX;
          newValue.xScale = newScale;
        }

        if (zoomYScale) {
          newValue.y = globalMouse.y - (globalMouse.y - prev.y) * factor;
          newValue.yScale = prev.yScale * factor;
        }
        return newValue;
      });
    },
    [updateView, zoomXScale, zoomYScale, isXScalingValid]
  );

  const onDrag = useCallback(
    (currMouse, prevMouse) => {
      updateView(prev => {
        const newX = Number(prev.x) + (currMouse.x - prevMouse.x);

        return {
          ...prev,
          y: zoomYScale ? Number(prev.y) + (currMouse.y - prevMouse.y) : prev.y,
          x: zoomXScale && isXScalingValid(prev.xScale, newX) ? newX : prev.x
        };
      });
    },
    [updateView, isXScalingValid, zoomYScale, zoomXScale]
  );

  useDraggable(stage, onDrag, width, height);

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
    const viewport = viewportRef.current;

    if (stage) {
      stage.addChild(viewport);
    }

    return () => {
      if (viewport && stage) {
        stage.removeChild(viewport);
        viewport.destroy({ children: true });
      }
    };
  }, [stage]);

  useEffect(
    function updateViewport() {
      const viewport = viewportRef.current;
      viewport.position = new PIXI.Point(view.x, view.y);
      viewport.scale.x = view.xScale;
      viewport.scale.y = view.yScale;
    },
    [view]
  );

  return viewportRef.current;
}
