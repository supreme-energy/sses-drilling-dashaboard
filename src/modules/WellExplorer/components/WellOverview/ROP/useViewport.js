import useRef from "react-powertools/hooks/useRef";
import { useCallback, useEffect } from "react";
import * as PIXI from "pixi.js";
// eslint-disable-next-line max-len
import { GRID_GUTTER } from "../../../../ComboDashboard/components/TimeSliderToolbar/TimeSliderContainer/TimeSlider/TimeSliderUtil";

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
  step,
  maxStep,
  zoom
}) {
  const interactionManagerRef = useRef(() => new PIXI.interaction.InteractionManager(renderer));
  const viewportRef = useRef(() => new PIXI.Container());

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

  useEffect(() => {
    if (zoom[1] !== 0) {
      const factor = 1 + zoom[1] * 0.03;

      // Calc new view, bound graph to sides of canvas when zooming
      updateView(prev => {
        const stepFactor = (step * factor * width) / maxStep + 160;
        const graphTotalLength = maxStep * prev.xScale;
        const graphHiddenLength = Math.abs(prev.x);
        const graphVisibleLength = graphTotalLength - graphHiddenLength;

        interactionManagerRef.current.mapPositionToPoint(globalMouse, stepFactor, 250);

        // Graph should either take up entire view, or be larger than view
        const isTotalOverflow = graphTotalLength * factor >= Math.floor(width - GRID_GUTTER);
        const isVisibleOverflow = graphVisibleLength * factor >= Math.floor(width - GRID_GUTTER);

        let newX = globalMouse.x - (globalMouse.x - prev.x) * factor;
        if (!isVisibleOverflow && zoom[1] < 0) {
          newX = newX + (width - graphVisibleLength * factor - 1);
        }

        return {
          ...prev,
          x: newX < 0 ? newX : prev.x,
          xScale: isTotalOverflow ? prev.xScale * factor : prev.xScale
        };
      });
    }
  }, [zoom, updateView, width]);

  useEffect(
    function makeStageInteractive() {
      if (stage) {
        stage.interactive = true;
        stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
      }
    },
    [stage, width, height]
  );

  useEffect(
    function enableMouseInteractions() {
      if (stage) {
        stage.mousedown = onMouseDown;
        stage.mousemove = onMouseMove;
        stage.mouseout = () => (interactionStateRef.current.isOutside = true);
        stage.mouseover = () => (interactionStateRef.current.isOutside = false);
        stage.mouseup = stage.mouseupoutside = () => (interactionStateRef.current.isDragging = false);
      }
      renderer.view.addEventListener("wheel", onWheel, false);

      return () => {
        renderer.view.removeEventListener("wheel", onWheel, false);
      };
    },
    [renderer, onWheel, stage, onMouseDown, onMouseMove]
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
