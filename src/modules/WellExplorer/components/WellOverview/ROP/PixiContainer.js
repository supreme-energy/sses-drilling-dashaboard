import useRef from "react-powertools/hooks/useRef";
import { useEffect } from "react";
import * as PIXI from "pixi.js";

export default function PixiContainer({ container: parentContainer, children, x, y, updateTransform }) {
  const containerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const container = containerRef.current;

    if (parentContainer) {
      parentContainer.addChild(container);
    }

    return () => {
      if (parentContainer) {
        parentContainer.removeChild(container);
      }
    };
  }, [parentContainer]);

  useEffect(
    function changeUpdateTransform() {
      if (updateTransform) {
        const container = containerRef.current;
        container.transform.updateTransform = updateTransform;
      }
    },
    [updateTransform]
  );

  useEffect(
    function updatePosition() {
      const container = containerRef.current;
      console.log("update position", x, y);
      container.x = x;
      container.y = y;
    },
    [x, y]
  );

  return children ? children(containerRef.current) : null;
}

PixiContainer.defaultProps = {
  x: 0,
  y: 0
};
