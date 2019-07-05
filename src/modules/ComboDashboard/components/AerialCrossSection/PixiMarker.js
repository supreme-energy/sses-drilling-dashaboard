import { useEffect, useImperativeHandle, forwardRef } from "react";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "../CrossSection/customPixiTransforms";

/* eslint new-cap: 0 */
function PixiMarker({ container, x, y, url, updateTransform, rotation }, ref) {
  const {
    current: { marker, initialUpdateTransform }
  } = useRef(() => {
    const texture = new PIXI.Texture.fromImage(url);
    const marker = new PIXI.Sprite(texture);

    if (rotation) {
      marker.rotation = rotation;
    }
    return {
      marker,
      initialUpdateTransform: marker.transform.updateTransform
    };
  });
  useEffect(
    function addMarker() {
      container.addChild(marker);
      return () => container.removeChild(marker);
    },
    [container, marker]
  );

  useEffect(
    function changeUpdateTransform() {
      if (updateTransform) {
        marker.transform.updateTransform = updateTransform;
      } else {
        marker.transform.updateTransform = initialUpdateTransform;
      }
    },
    [updateTransform, marker, initialUpdateTransform]
  );

  useEffect(
    function updateMarker() {
      marker.x = x;
      marker.y = y;
    },
    [x, y, marker]
  );

  useImperativeHandle(ref, () => ({
    marker
  }));

  return null;
}

const ForwardedPixiMarker = forwardRef(PixiMarker);
ForwardedPixiMarker.defaultProps = {
  x: 0,
  y: 0,
  anchor: [0, 0],
  updateTransform: frozenScaleTransform
};
export default ForwardedPixiMarker;
