import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiRectangle(
  { container, width, height, backgroundColor, borderColor, borderThickness, x, y, alpha, updateTransform },
  ref
) {
  const {
    current: { bg, initialUpdateTransform }
  } = useRef(() => {
    const bg = new PIXI.Graphics();
    return {
      bg: new PIXI.Graphics(),
      initialUpdateTransform: bg.transform.updateTransform
    };
  });
  useEffect(
    function addBackground() {
      container.addChild(bg);
      return () => container.removeChild(bg);
    },
    [container, bg]
  );

  useEffect(
    function reposition() {
      bg.x = x;
      bg.y = y;
    },
    [x, y, bg]
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
    function redraw() {
      bg.clear();
      bg.alpha = alpha;
      if (backgroundColor) {
        bg.beginFill(backgroundColor);
      }
      bg.lineStyle(borderThickness, borderColor);
      bg.drawRect(0, 0, width, height);
    },
    [width, height, backgroundColor, borderColor, borderThickness, alpha, updateTransform, bg]
  );

  useImperativeHandle(ref, () => ({
    graphics: bg
  }));

  return null;
}

const ForwardedPixiRectangle = forwardRef(PixiRectangle);

ForwardedPixiRectangle.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  alpha: PropTypes.number,
  updateTransform: PropTypes.func,
  xIndex: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  backgroundColor: PropTypes.number,
  borderColor: PropTypes.number,
  borderThickness: PropTypes.number
};

ForwardedPixiRectangle.defaultProps = {
  x: 0,
  y: 0,
  alpha: 1
};

export default ForwardedPixiRectangle;
