import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { frozenScaleTransform } from "../modules/ComboDashboard/components/CrossSection/customPixiTransforms";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiTriangle(
  { container, backgroundColor, borderColor, borderThickness, x, y, radius, startAngle, endAngle, offset },
  ref
) {
  const { current: triangle } = useRef(() => {
    const triangle = new PIXI.Graphics();
    triangle.transform.updateTransform = frozenScaleTransform;
    return triangle;
  });
  useEffect(
    function addBackground() {
      container.addChild(triangle);
      return () => {
        container.removeChild(triangle);
      };
    },
    [container, triangle]
  );

  useEffect(
    function reposition() {
      triangle.x = x;
      triangle.y = y;
    },
    [x, y, triangle]
  );

  useEffect(
    function redraw() {
      triangle.clear();
      if (backgroundColor) {
        triangle.beginFill(backgroundColor);
      }

      triangle.lineStyle(1, backgroundColor, 0);

      // Draw triangle to fill in arc
      triangle.moveTo(0, 0);
      const x1 = radius * Math.sin(startAngle + offset);
      const x2 = radius * Math.sin(endAngle + offset);
      const y1 = radius * Math.cos(startAngle + offset);
      const y2 = radius * Math.cos(endAngle + offset);
      triangle.lineTo(x1, y1);
      triangle.lineTo(x2, y2);
    },
    [radius, backgroundColor, borderColor, borderThickness, triangle, startAngle, endAngle, offset]
  );

  useImperativeHandle(ref, () => ({
    graphics: triangle
  }));

  return null;
}

const ForwardedPixiTriangle = forwardRef(PixiTriangle);

ForwardedPixiTriangle.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  radius: PropTypes.number,
  container: PropTypes.object.isRequired,
  backgroundColor: PropTypes.number,
  borderColor: PropTypes.number,
  borderThickness: PropTypes.number
};

ForwardedPixiTriangle.defaultProps = {
  x: 0,
  y: 0,
  radius: 4,
  offset: 0
};

export default ForwardedPixiTriangle;
