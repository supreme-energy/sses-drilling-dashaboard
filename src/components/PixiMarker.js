import { useEffect, useImperativeHandle, forwardRef } from "react";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "../modules/ComboDashboard/components/CrossSection/customPixiTransforms";

/* eslint new-cap: 0 */
function PixiMarker({ container, x, y, url, updateTransform, rotation, anchor, scale }, ref) {
  const {
    current: { marker, initialUpdateTransform }
  } = useRef(() => {
    const texture = PIXI.Texture.from(url);
    const marker = new PIXI.Sprite(texture);

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
      marker.anchor.set(...anchor);

      if (rotation) {
        marker.rotation = rotation;
      }
      if (scale) {
        marker.scale.x = scale;
        marker.scale.y = scale;
      }

      marker.x = x;
      marker.y = y;
    },
    [x, y, anchor, rotation, marker, scale]
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
