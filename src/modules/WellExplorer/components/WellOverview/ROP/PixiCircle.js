import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function PixiCircle({ container, width, height, backgroundColor, borderColor, borderThickness, x, y, radius }, ref) {
  const { current: point } = useRef(() => {
    const point = new PIXI.Graphics();
    point.transform.updateTransform = frozenScaleTransform;
    return point;
  });
  useEffect(
    function addBackground() {
      container.addChild(point);
      return () => container.removeChild(point);
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

      point.lineStyle(borderThickness, borderColor);

      point.drawCircle(0, 0, radius);
    },
    [radius, backgroundColor, borderColor, borderThickness, point]
  );

  useImperativeHandle(ref, () => ({
    graphics: point
  }));

  return null;
}

const ForwardedPixiCircle = forwardRef(PixiCircle);

ForwardedPixiCircle.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  radius: PropTypes.number,
  container: PropTypes.object.isRequired,
  backgroundColor: PropTypes.number,
  borderColor: PropTypes.number,
  borderThickness: PropTypes.number
};

ForwardedPixiCircle.defaultProps = {
  x: 0,
  y: 0,
  radius: 4
};

export default ForwardedPixiCircle;
