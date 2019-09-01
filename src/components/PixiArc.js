import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { frozenScaleTransform } from "../modules/ComboDashboard/components/CrossSection/customPixiTransforms";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiArc(
  { container, backgroundColor, borderColor, borderThickness, x, y, radius, startAngle, endAngle },
  ref
) {
  const { current: point } = useRef(() => {
    const point = new PIXI.Graphics();
    point.transform.updateTransform = frozenScaleTransform;
    return point;
  });
  useEffect(
    function addBackground() {
      container.addChild(point);
      return () => {
        container.removeChild(point);
      };
    },
    [container, point]
  );

  useEffect(
    function reposition() {
      point.x = x;
      point.y = y;
    },
    [x, y, point]
  );

  useEffect(
    function redraw() {
      point.clear();
      if (backgroundColor) {
        point.beginFill(backgroundColor);
      }

      point.lineStyle(borderThickness, backgroundColor);

      // Draw Arc
      point.arc(0, 0, radius, startAngle, endAngle, true);
    },
    [radius, backgroundColor, borderColor, borderThickness, point, startAngle, endAngle]
  );

  useImperativeHandle(ref, () => ({
    graphics: point
  }));

  return null;
}

const ForwardedPixiArc = forwardRef(PixiArc);

ForwardedPixiArc.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  radius: PropTypes.number,
  container: PropTypes.object.isRequired,
  backgroundColor: PropTypes.number,
  borderColor: PropTypes.number,
  borderThickness: PropTypes.number
};

ForwardedPixiArc.defaultProps = {
  x: 0,
  y: 0,
  radius: 4,
  offset: 0
};

export default ForwardedPixiArc;
