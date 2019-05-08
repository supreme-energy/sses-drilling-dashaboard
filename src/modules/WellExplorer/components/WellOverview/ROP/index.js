import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useRopData } from "../../../../../api";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useSize } from "react-hook-size";
import chunk from "lodash/chunk";

function useWebglRenderer({ canvas, width, height }) {
  const stage = useRef(() => new PIXI.Container());

  const rendererRef = useRef(() =>
    PIXI.autoDetectRenderer({
      width,
      height,
      antialias: true,
      backgroundColor: 0xffffff
    })
  );

  useEffect(
    function resizeRenderer() {
      rendererRef.current.resize(width, height);
    },
    [width, height]
  );

  useEffect(() => {
    if (canvas) {
      canvas.appendChild(rendererRef.current.view);
    }
  }, [canvas]);

  function refresh() {
    rendererRef.current.render(stage.current);
  }

  return [stage.current, refresh, rendererRef.current];
}

const globalMouse = { x: 0, y: 0 };

// enable mouse wheel and drag
function useViewport({ renderer, stage, width, height }) {
  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });
  const interactionManagerRef = useRef(() => new PIXI.interaction.InteractionManager(renderer));
  const viewportRef = useRef(() => new PIXI.Container());

  const onWhell = useCallback(e => {
    e.preventDefault();
    interactionManagerRef.current.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

    // sign of deltaY (-1,0,1) determines zoom in or out
    const factor = 1 - Math.sign(e.deltaY) * 0.03;

    updateView(prev => ({
      x: globalMouse.x - (globalMouse.x - prev.x) * factor,
      y: globalMouse.y - (globalMouse.y - prev.y) * factor,
      xScale: prev.xScale * factor,
      yScale: prev.yScale * factor
    }));
  }, []);

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

  const onMouseMove = useCallback(moveData => {
    const interactionState = interactionStateRef.current;
    if (!interactionState.isDragging || interactionState.isOutside) {
      return;
    }

    const currMouse = moveData.data.global;
    updateView(prev => ({
      ...prev,
      x: Number(prev.x) + (currMouse.x - interactionState.prevMouse.x),
      y: Number(prev.y) + (currMouse.y - interactionState.prevMouse.y)
    }));

    Object.assign(interactionState.prevMouse, currMouse);
  }, []);

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

  return [viewportRef.current, view, updateView];
}

function useDrawLine(container, data, mapData) {
  const lineData = useMemo(() => data.map(mapData), [data, mapData]);
  const lineG = useRef(() => new PIXI.Graphics());

  useEffect(() => {
    const lineGraphic = lineG.current;
    container.addChild(lineGraphic);
    return () => container.removeChild(lineGraphic);
  }, [container]);

  useEffect(() => {
    function drawLine(data) {
      if (data && data.length) {
        lineG.current.clear().lineStyle(1, 0x000000, 1);
        // pixi only draw a maximum number of points on subsequent lineTo that is machine dependent.
        // I'm picking 10k that should be safe (15k works also)
        const chunks = chunk(data, 10000);
        chunks.forEach(chunk => {
          lineG.current.moveTo(...chunk[0]);
          chunk.forEach(point => {
            lineG.current.lineTo(point[0], point[1]);
          });
        });
      }
    }
    drawLine(lineData);
  }, [lineData]);
}

const useRectangle = ({ container, width, height, color }) => {
  const bgRef = useRef(() => new PIXI.Graphics());
  useEffect(
    function addBackground() {
      const bg = bgRef.current;
      container.addChild(bg);
      return () => container.removeChild(bg);
    },
    [container]
  );

  useEffect(
    function redraw() {
      const bg = bgRef.current;
      bg.clear();
      bg.beginFill(color);
      bg.lineStyle(1);
      bg.drawRect(0, 0, width, height);
    },
    [width, height, color]
  );

  return bgRef.current;
};

const mapAverage = d => [Number(d.ROP_A), Number(d.Hole_Depth)];

export default function Rop({ className, style }) {
  const data = useRopData();

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebglRenderer({ canvas: canvasRef.current, width, height });
  useRectangle({ container: stage, color: 0xffffff, width, height });
  const [viewport] = useViewport({ renderer, stage, width, height });

  useDrawLine(viewport, data, mapAverage);

  useEffect(() => {
    refresh();
  }, [refresh, stage, data]);

  return <div className={className} style={style} ref={canvasRef} />;
}
