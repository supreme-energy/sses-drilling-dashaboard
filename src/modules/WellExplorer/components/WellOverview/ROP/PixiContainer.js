import useRef from "react-powertools/hooks/useRef";
import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

function Container({ container: parentContainer, children, x, y, updateTransform, name }, ref) {
  const {
    current: { container, initialUpdateTransform }
  } = useRef(() => {
    const container = new PIXI.Container();
    return {
      container,
      initialUpdateTransform: container.transform.updateTransform
    };
  });

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

  return React.Children.map(child => child(container));
}

const PixiContainer = forwardRef(Container);

PixiContainer.propTypes = {
  updateTransform: PropTypes.func,
  children: PropTypes.func,
  container: PropTypes.object.isRequired,
  x: PropTypes.number,
  y: PropTypes.number
};

PixiContainer.defaultProps = {
  x: 0,
  y: 0
};
export default PixiContainer;
