import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiRectangle(
  { container, width, height, backgroundColor, borderColor, borderThickness, x, y, alpha, updateTransform },
  ref
) {
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
    function reposition() {
      const bg = bgRef.current;
      bg.x = x;
      bg.y = y;
    },
    [x, y]
  );

  useEffect(
    function redraw() {
      const bg = bgRef.current;
      if (updateTransform) {
        bg.transform.updateTransform = updateTransform;
      }

      bg.clear();
      bg.alpha = alpha;
      if (backgroundColor) {
        bg.beginFill(backgroundColor);
      }
      bg.lineStyle(borderThickness, borderColor);
      bg.drawRect(0, 0, width, height);
    },
    [width, height, backgroundColor, borderColor, borderThickness, alpha, updateTransform]
  );

  useImperativeHandle(ref, () => ({
    graphics: bgRef.current
  }));

  return null;
}

const ForwardedPixiRectangle = forwardRef(PixiRectangle);

ForwardedPixiRectangle.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  alpha: PropTypes.number,
  updateTransform: PropTypes.func,
  xIndex: PropTypes.number
};

ForwardedPixiRectangle.defaultProps = {
  x: 0,
  y: 0,
  alpha: 1
};

export default ForwardedPixiRectangle;
