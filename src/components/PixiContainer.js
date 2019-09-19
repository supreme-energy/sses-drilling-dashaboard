import useRef from "react-powertools/hooks/useRef";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function Container(
  { container: parentContainer, child, x, y, updateTransform, name, zIndex, scale, pivot, width, height, onClick },
  ref
) {
  const internalStateRef = useRef(() => {
    const container = new PIXI.Container();
    return {
      container,
      initialUpdateTransform: container.transform.updateTransform
    };
  });

  const {
    current: { container, initialUpdateTransform }
  } = internalStateRef;

  useEffect(() => {
    container.sortableChildren = true;

    if (parentContainer) {
      parentContainer.addChild(container);
    }

    return () => {
      if (parentContainer) {
        parentContainer.removeChild(container);
      }
    };
  }, [parentContainer, container]);

  useEffect(
    function changeUpdateTransform() {
      if (updateTransform) {
        container.transform.updateTransform = updateTransform;
      } else {
        container.transform.updateTransform = initialUpdateTransform;
      }
    },
    [updateTransform, container, initialUpdateTransform]
  );

  useImperativeHandle(ref, () => ({
    container
  }));

  useEffect(
    function updatePosition() {
      container.x = x;
      container.y = y;
    },
    [x, y, container]
  );

  useEffect(
    function updateScale() {
      if (scale) {
        container.scale = scale;
      }
    },
    [container, scale]
  );

  useEffect(
    function updatePivot() {
      if (pivot) {
        container.pivot = pivot;
      }
    },
    [container, pivot]
  );

  useEffect(
    function updateWidth() {
      if (width !== undefined) {
        container.width = width;
      }

      if (height !== undefined) {
        container.height = height;
      }
    },

    [container, width, height]
  );

  useEffect(
    function updateZindex() {
      container.zIndex = zIndex;
    },
    [zIndex, container]
  );

  useEffect(
    function addEvents() {
      const container = internalStateRef.current.container;

      onClick && container.on("click", onClick);

      return () => {
        onClick && container.off("click", onClick);
      };
    },
    [onClick]
  );

  return child ? child(container) : null;
}

const PixiContainer = forwardRef(Container);

PixiContainer.propTypes = {
  updateTransform: PropTypes.func,
  child: PropTypes.func,
  container: PropTypes.object.isRequired,
  x: PropTypes.number,
  y: PropTypes.number
};

PixiContainer.defaultProps = {
  x: 0,
  y: 0
};
export default PixiContainer;
