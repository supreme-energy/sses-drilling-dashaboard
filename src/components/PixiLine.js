import useRef from "react-powertools/hooks/useRef";
import { useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import chunk from "lodash/chunk";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

const PixiLine = forwardRef(({ container, data, mapData, color, nativeLines, view, lineWidth, scale, x, y }, ref) => {
  const lineData = useMemo(() => data.map(mapData), [data, mapData]);
  // pixi only draw a maximum number of points on subsequent lineTo that is machine dependent.
  // I'm picking 10k that should be safe (15k works also)
  const chunks = useMemo(() => chunk(lineData, 10000), [lineData]);
  const { current: lines } = useRef([]);

  const lineG = useRef(() => new PIXI.Graphics());
  const { current: lineGraphic } = lineG;

  useEffect(() => {
    container.addChild(lineGraphic);
    return () => container.removeChild(lineGraphic);
  }, [container, lineGraphic]);

  useEffect(() => {
    for (let i = 0; i <= chunks.length - 1; i++) {
      lines.push(lineGraphic.addChild(new PIXI.Graphics()));
    }
    return () => {
      lines.forEach(line => lineGraphic.removeChild(line));
      lines.length = 0;
    };
  }, [lineGraphic, chunks.length, lines]);

  useEffect(
    function drawLine() {
      if (lineData && lineData.length) {
        for (let i = 0; i <= lines.length - 1; i++) {
          lines[i].clear().lineStyle(lineWidth, color, 1, 1, nativeLines);
        }

        chunks.forEach((chunk, i) => {
          lines[i].moveTo(chunk[0][0] * view.xScale, chunk[0][1] * view.yScale);
          chunk.forEach(point => {
            lines[i].lineTo(point[0] * view.xScale, point[1] * view.yScale);
          });
        });
      }
    },
    [view, lines, chunks, nativeLines, color, lineData, lineWidth]
  );

  useEffect(
    function updateScale() {
      if (scale) {
        lineGraphic.scale.set(scale.x, scale.y);
      }
    },
    [scale, lineGraphic]
  );

  useEffect(
    function updatePosition() {
      lineGraphic.position.set(x, y);
      lineGraphic.x = x;
      lineGraphic.y = y;
    },
    [x, y, lineGraphic]
  );

  useImperativeHandle(ref, () => ({
    lineGraphics: lineG.current
  }));

  return null;
});

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
  x: 0,
  y: 0,
  lineWidth: 1,
  view: { xScale: 1, yScale: 1 },
  mapData: d => d
};

export default PixiLine;
