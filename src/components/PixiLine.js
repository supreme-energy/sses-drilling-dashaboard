import useRef from "react-powertools/hooks/useRef";
import { useMemo, useEffect } from "react";
import chunk from "lodash/chunk";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function draw(lineG, lineWidth, color, lineData, view, native) {
  lineG.current.clear().lineStyle(lineWidth, color, 1, 1, native);
  // pixi only draw a maximum number of points on subsequent lineTo that is machine dependent.
  // I'm picking 10k that should be safe (15k works also)
  const chunks = chunk(lineData, 10000);
  chunks.forEach(chunk => {
    lineG.current.moveTo(chunk[0][0] * view.xScale, chunk[0][1] * view.yScale);
    chunk.forEach(point => {
      lineG.current.lineTo(point[0] * view.xScale, point[1] * view.yScale);
    });
  });
}

export default function PixiLine({ container, data, mapData, color, nativeLines, view, lineWidth }) {
  const lineData = useMemo(() => data.map(mapData), [data, mapData]);
  const lineG = useRef(() => new PIXI.Graphics());

  useEffect(() => {
    const lineGraphic = lineG.current;
    container.addChild(lineGraphic);
    return () => container.removeChild(lineGraphic);
  }, [container]);

  useEffect(
    function drawLine() {
      if (lineData && lineData.length) {
        draw(lineG, lineWidth, color, lineData, view, nativeLines);
      }
    },
    [view, nativeLines, color, lineData, lineWidth]
  );

  return null;
}

PixiLine.propTypes = {
  nativeLines: PropTypes.bool,
  data: PropTypes.array.isRequired,
  container: PropTypes.object,
  mapData: PropTypes.func.isRequired,
  color: PropTypes.number,
  view: PropTypes.object,
  lineWidth: PropTypes.number
};

PixiLine.defaultProps = {
  nativeLines: true,
  lineWidth: 1,
  view: { xScale: 1, yScale: 1 },
  mapData: d => d
};
