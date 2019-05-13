import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiPoint({ container, width, height, backgroundColor, borderColor, borderThickness, x, y, radius }, ref) {
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
      const bg = bgRef.current;

      bg.clear();
      if (backgroundColor) {
        bg.beginFill(backgroundColor);
      }
      bg.lineStyle(borderThickness, borderColor);
      bg.drawCircle(0, 0, radius);
    },
    [radius, backgroundColor, borderColor, borderThickness]
  );

  useImperativeHandle(ref, () => ({
    graphics: bgRef.current
  }));

  return null;
}

const ForwardedPixiPoint = forwardRef(PixiPoint);

ForwardedPixiPoint.PropTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  radius: PropTypes.number
};

ForwardedPixiPoint.defaultProps = {
  x: 0,
  y: 0,
  radius: 4
};

export default ForwardedPixiPoint;
