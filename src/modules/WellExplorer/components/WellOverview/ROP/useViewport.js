import useRef from "react-powertools/hooks/useRef";
import { useCallback, useEffect } from "react";
import * as PIXI from "pixi.js";

const globalMouse = { x: 0, y: 0 };
// enable mouse wheel and drag
export default function useViewport({ renderer, stage, width, height, updateView, view, zoomXScale, zoomYScale }) {
  const interactionManagerRef = useRef(() => new PIXI.interaction.InteractionManager(renderer));
  const viewportRef = useRef(() => new PIXI.Container());

  const onWhell = useCallback(
    e => {
      e.preventDefault();
      interactionManagerRef.current.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

      // sign of deltaY (-1,0,1) determines zoom in or out
      const factor = 1 - Math.sign(e.deltaY) * 0.03;

      updateView(prev => {
        const newValue = {
          ...prev
        };

        if (zoomXScale) {
          newValue.x = globalMouse.x - (globalMouse.x - prev.x) * factor;
          newValue.xScale = prev.xScale * factor;
        }

        if (zoomYScale) {
          newValue.y = globalMouse.y - (globalMouse.y - prev.y) * factor;
          newValue.yScale = prev.yScale * factor;
        }
        return newValue;
      });
    },
    [updateView, zoomXScale, zoomYScale]
  );

  const interactionStateRef = useRef({
    isDragging: false,
    isOutside: false,
    prevMouse: {}
  });

  const onMouseDown = useCallback(function(moveData) {
    const interactionState = interactionStateRef.current;
    const pos = moveData.data.global;
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
      updateView(prev => ({
        ...prev,
        y: zoomYScale ? Number(prev.y) + (currMouse.y - interactionState.prevMouse.y) : prev.y,
        x: zoomXScale ? Number(prev.x) + (currMouse.x - prev.x) : prev.x
      }));

      Object.assign(interactionState.prevMouse, currMouse);
    },
    [updateView, zoomXScale, zoomYScale]
  );

  useEffect(
    function makeStageInteractive() {
      stage.interactive = true;
      stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    },
    [stage, width, height]
  );

  useEffect(
    function enableMouseInteractions() {
      stage.mousedown = onMouseDown;
      stage.mousemove = onMouseMove;
      stage.mouseout = () => (interactionStateRef.current.isOutside = true);
      stage.mouseover = () => (interactionStateRef.current.isOutside = false);
      stage.mouseup = stage.mouseupoutside = () => (interactionStateRef.current.isDragging = false);
      renderer.view.addEventListener("wheel", onWhell, false);

      return () => {
        renderer.view.removeEventListener("wheel", onWhell, false);
      };
    },
    [renderer, onWhell, stage, onMouseDown, onMouseMove]
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (stage) {
      stage.addChild(viewport);
    }

    return () => {
      if (viewport) {
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
