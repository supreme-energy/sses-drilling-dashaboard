import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useRopData } from "../../../../../api";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";

function useWebglRenderer(canvas) {
  const stage = useRef(new PIXI.Container());

  const rendererRef = useRef(
    PIXI.autoDetectRenderer({
      width: 400,
      height: 400,
      antialias: true,
      backgroundColor: 0xffffff
    })
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

function useZoom(renderer) {
  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });
  const interactionManagerRef = useRef(new PIXI.interaction.InteractionManager(renderer));

  useEffect(
    function enableZoom() {
      const globalMouse = { x: 0, y: 0 };
      renderer.view.addEventListener(
        "wheel",
        e => {
          console.log("whell");
          e.preventDefault();
          interactionManagerRef.current.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

          // sign of deltaY (-1,0,1) determines zoom in or out
          const factor = 1 - Math.sign(e.deltaY) * 0.03;
          const prev = view;
          updateView({
            x: globalMouse.x - (globalMouse.x - prev.x) * factor,
            y: globalMouse.y - (globalMouse.y - prev.y) * factor,
            xScale: prev.xScale * factor,
            yScale: prev.yScale * factor
          });
        },
        false
      );
    },
    [renderer, view]
  );

  return [view, updateView];
}

function useDrawLine(container, data, mapData) {
  const lineData = useMemo(() => data.map(mapData), [data, mapData]);
  const lineG = useRef(new PIXI.Graphics());
  useEffect(() => {
    const lineGraphic = lineG.current;
    container.addChild(lineGraphic);
    return () => container.removeChild(lineGraphic);
  }, [container]);

  useEffect(() => {
    function drawLine(data) {
      console.log("draw");
      if (data && data.length) {
        lineG.current.clear().lineStyle(1, 0x000000, 1);
        lineG.current.moveTo(...data[0]);
        for (let i = 1; i < data.length; i++) {
          lineG.current.lineTo(...data[i]);
        }
      }
    }
    drawLine(lineData);
  }, [lineData]);
}

const mapAverage = d => [Number(d.ROP_A), Number(d.Hole_Depth)];

export default function Rop() {
  const data = useRopData();

  const canvasRef = useRef(null);
  const [stage, refresh, renderer] = useWebglRenderer(canvasRef.current);
  const [view, updateView] = useZoom(renderer);
  console.log("view", view);
  useEffect(() => {
    const bgx = new PIXI.Graphics();
    bgx.beginFill(0xffffff);
    bgx.lineStyle(1);
    bgx.drawRect(0, 0, 400, 400);
    stage.addChild(bgx);

    return () => stage.removeChild(bgx);
  }, [stage]);

  useDrawLine(stage, data, mapAverage);

  useEffect(() => {
    refresh();
  }, [refresh, stage, data]);

  return <div ref={canvasRef} />;
}
