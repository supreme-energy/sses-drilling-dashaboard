import useRef from "react-powertools/hooks/useRef";
import { useEffect, useMemo } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function drawRectangle(bg, width, height, y, data) {
  data.forEach(point => {
    if (point[1]) {
      bg.drawRect(point[0], y, width, height * point[1]);
    }
  });
}

function PixiBar({ container, width, height, data, mapData, color, x, y, alpha, updateTransform, zIndex }) {
  const {
    current: { bg, initialUpdateTransform }
  } = useRef(() => {
    const bg = new PIXI.Graphics();
    return {
      bg,
      initialUpdateTransform: bg.transform.updateTransform
    };
  });

  const barData = useMemo(() => data.map(mapData), [data, mapData]);

  useEffect(
    function reposition() {
      bg.x = x;
      bg.y = y;
    },
    [x, y, bg]
  );

  useEffect(
    function addBackground() {
      container.addChild(bg);
      return () => container.removeChild(bg);
    },
    [container, bg]
  );

  useEffect(
    function changeUpdateTransform() {
      if (updateTransform) {
        bg.transform.updateTransform = updateTransform;
      } else {
        bg.transform.updateTransform = initialUpdateTransform;
      }
    },
    [updateTransform, bg, initialUpdateTransform]
  );

  useEffect(
    function updateZindex() {
      bg.zIndex = zIndex;
    },
    [zIndex, bg]
  );

  useEffect(
    function redraw() {
      bg.clear();
      bg.alpha = alpha;
      if (color) {
        bg.beginFill(color);
      }
      drawRectangle(bg, width, height, y, barData);
    },
    [width, color, barData, alpha, bg, y, height]
  );

  return null;
}

PixiBar.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  alpha: PropTypes.number,
  updateTransform: PropTypes.func,
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
