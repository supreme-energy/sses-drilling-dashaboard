import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";

function Container({ container: parentContainer, children, x, y, updateTransform }, ref) {
  const containerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const container = containerRef.current;
    container.sortableChildren = true;
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

  useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  useEffect(
    function updatePosition() {
      const container = containerRef.current;
      container.x = x;
      container.y = y;
    },
    [x, y]
  );

  return children ? children(containerRef.current) : null;
}

const PixiContainer = forwardRef(Container);
PixiContainer.defaultProps = {
  x: 0,
  y: 0
};
export default PixiContainer;
