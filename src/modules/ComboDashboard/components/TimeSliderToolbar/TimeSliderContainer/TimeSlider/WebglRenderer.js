import { useCallback, useEffect } from "react";
import * as PIXI from "pixi.js";
import useRef from "react-powertools/hooks/useRef";

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

  const refresh = useCallback(() => {
    rendererRef.current.render(stage.current);
  }, []);

  return [stage.current, refresh, rendererRef.current];
}

export default useWebglRenderer;
