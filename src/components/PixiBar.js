import useRef from "react-powertools/hooks/useRef";
import { useEffect, useMemo } from "react";
import * as PIXI from "pixi.js";
import chunk from "lodash/chunk";
import PropTypes from "prop-types";

function PixiBar({ container, width, height, data, mapData, color, x, y, alpha, zIndex }) {
  const barData = useMemo(() => data.map(mapData), [data, mapData]);
  const chunks = useMemo(() => chunk(barData, 10000), [barData]);
  const {
    current: { bgs }
  } = useRef(() => {
    const bgs = [];
    return {
      bgs
    };
  });

  useEffect(
    function addContainer() {
      chunks.forEach(() => {
        bgs.push(container.addChild(new PIXI.Graphics()));
      });

      return () => {
        bgs.forEach(bg => container.removeChild(bg));
        bgs.length = 0;
      };
    },
    [bgs, chunks, container]
  );

  useEffect(
    function reposition() {
      for (let i = 0; i < bgs.length - 1; i++) {
        bgs[i].x = x;
        bgs[i].y = y;
      }
    },
    [bgs, x, y]
  );

  useEffect(
    function updateZIndex() {
      for (let i = 0; i < bgs.length - 1; i++) {
        bgs[i].zIndex = zIndex;
      }
    },
    [bgs, zIndex]
  );

  useEffect(
    function redraw() {
      chunks.forEach((chunk, index) => {
        const chunkGraphic = bgs[index];
        chunkGraphic.clear();
        chunkGraphic.alpha = alpha;
        if (color) {
          chunkGraphic.beginFill(color);
        }

        chunk.forEach(point => {
          if (point[1]) {
            chunkGraphic.drawRect(point[0], y, width, height * point[1]);
          }
        });
      });
    },
    [width, chunks, color, alpha, bgs, y, height]
  );

  return null;
}

PixiBar.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  alpha: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  color: PropTypes.number
};

PixiBar.defaultProps = {
  x: 0,
  y: 0,
  alpha: 1
};

export default PixiBar;
