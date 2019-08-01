import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

const PixiRectangle = forwardRef(
  (
    {
      container,
      width,
      height,
      backgroundColor,
      backgroundAlpha,
      borderColor,
      borderThickness,
      x,
      y,
      alpha,
      updateTransform,
      radius,
      onClick,
      onMouseOver,
      onMouseOut,
      zIndex
    },
    ref
  ) => {
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

    useEffect(() => {
      bg.interactive = !!onClick;
      if (onClick) {
        bg.on("click", onClick);
      } else {
        bg.off("click", onClick);
      }

      return () => {
        bg.off("click", onClick);
      };
    }, [onClick, bg]);

    useEffect(() => {
      if (onMouseOver) {
        bg.interactive = !!onMouseOver;
        bg.mouseover = onMouseOver;
      }

      if (onMouseOut) {
        bg.interactive = !!onMouseOut;
        bg.mouseout = onMouseOut;
      }

      return () => {
        bg.mouseover = null;
        bg.mouseout = null;
      };
    }, [onMouseOver, onMouseOut, bg]);

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
        if (backgroundColor) {
          bg.beginFill(backgroundColor, backgroundAlpha);
        }
        bg.lineStyle(borderThickness, borderColor);
        radius ? bg.drawRoundedRect(0, 0, width, height, radius) : bg.drawRect(0, 0, width, height);
      },
      [
        width,
        height,
        backgroundColor,
        backgroundAlpha,
        borderColor,
        borderThickness,
        alpha,
        updateTransform,
        bg,
        radius
      ]
    );

    useImperativeHandle(ref, () => ({
      graphics: bg
    }));

    return null;
  }
);

PixiRectangle.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  alpha: PropTypes.number,
  updateTransform: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  backgroundColor: PropTypes.number,
  borderColor: PropTypes.number,
  borderThickness: PropTypes.number,
  radius: PropTypes.number,
  onClick: PropTypes.func,
  zIndex: PropTypes.number,
  backgroundAlpha: PropTypes.number
};

PixiRectangle.defaultProps = {
  x: 0,
  y: 0,
  alpha: 1,
  radius: 0,
  backgroundAlpha: 1
};

export default PixiRectangle;
