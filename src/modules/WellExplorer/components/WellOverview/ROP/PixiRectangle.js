import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiRectangle({ container, width, height, backgroundColor, borderColor, borderThickness, x, y }, ref) {
  const bgRef = useRef(() => new PIXI.Graphics());
  useEffect(
    function addBackground() {
      const bg = bgRef.current;
      bg.transform.updateTransform = frozenScaleTransform;
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
      console.log("redraw", backgroundColor, height);
      const bg = bgRef.current;

      bg.clear();
      if (backgroundColor) {
        bg.beginFill(backgroundColor);
      }
      bg.lineStyle(borderThickness, borderColor);
      bg.drawRect(0, 0, width, height);
    },
    [width, height, backgroundColor, borderColor, borderThickness]
  );

  useImperativeHandle(ref, () => ({
    graphics: bgRef.current
  }));

  return null;
}

const ForwardedPixiRectangle = forwardRef(PixiRectangle);

ForwardedPixiRectangle.PropTypes = {
  x: PropTypes.number,
  y: PropTypes.number
};

ForwardedPixiRectangle.defaultProps = {
  x: 0,
  y: 0
};

export default ForwardedPixiRectangle;
