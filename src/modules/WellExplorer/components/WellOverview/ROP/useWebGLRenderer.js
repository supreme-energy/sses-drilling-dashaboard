import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useEffect, useCallback } from "react";

export function useWebGLRenderer({ canvas, width, height }) {
  const stage = useRef(() => {
    const s = new PIXI.Container();
    s.sortableChildren = true;
    return s;
  });

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

  const refresh = useCallback(() => {
    rendererRef.current.render(stage.current);
  }, []);

  return [stage.current, refresh, rendererRef.current];
}
