import useRef from "react-powertools/hooks/useRef";
import { useMemo, useEffect, useCallback } from "react";
import chunk from "lodash/chunk";
import * as PIXI from "pixi.js";

export default function PixiLine({ container, data, mapData, color }) {
  const lineData = useMemo(() => data.map(mapData), [data, mapData]);
  const lineG = useRef(() => new PIXI.Graphics(true));

  useEffect(() => {
    const lineGraphic = lineG.current;
    container.addChild(lineGraphic);
    return () => container.removeChild(lineGraphic);
  }, [container]);

  const drawLine = useCallback(
    function drawLine() {
      if (lineData && lineData.length) {
        lineG.current.clear().lineStyle(1, color, 1);

        // pixi only draw a maximum number of points on subsequent lineTo that is machine dependent.
        // I'm picking 10k that should be safe (15k works also)
        const chunks = chunk(lineData, 10000);
        chunks.forEach(chunk => {
          lineG.current.moveTo(...chunk[0]);
          chunk.forEach(point => {
            lineG.current.lineTo(point[0], point[1]);
          });
        });
      }
    },
    [lineData, color]
  );

  useEffect(() => {
    drawLine();
  }, [container, drawLine]);

  return null;
}
