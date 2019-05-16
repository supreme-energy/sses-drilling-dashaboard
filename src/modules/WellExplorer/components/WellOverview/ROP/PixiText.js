import { useEffect, useImperativeHandle, forwardRef } from "react";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";

function PixiText({ container, fontSize, color, x, y, text, anchor, updateTransform }, ref) {
  const {
    current: { pixiText, initialUpdateTransform }
  } = useRef(() => {
    const pixiText = new PIXI.Text("");
    return {
      pixiText,
      initialUpdateTransform: pixiText.transform.updateTransform
    };
  });
  useEffect(
    function addText() {
      container.addChild(pixiText);
      return () => container.removeChild(pixiText);
    },
    [container, pixiText]
  );

  useEffect(
    function changeUpdateTransform() {
      if (updateTransform) {
        pixiText.transform.updateTransform = updateTransform;
      } else {
        pixiText.transform.updateTransform = initialUpdateTransform;
      }
    },
    [updateTransform, pixiText, initialUpdateTransform]
  );

  useEffect(
    function updateText() {
      pixiText.x = x;
      pixiText.y = y;
      pixiText.anchor.set(...anchor);
      pixiText.text = text;
      pixiText.style.fontSize = fontSize;
      pixiText.style.fill = color;
    },
    [x, y, text, fontSize, color, anchor, updateTransform, pixiText]
  );

  useImperativeHandle(ref, () => ({
    pixiText
  }));

  return null;
}

const ForwardedPixiText = forwardRef(PixiText);
ForwardedPixiText.defaultProps = {
  x: 0,
  y: 0,
  anchor: [0, 0],
  updateTransform: frozenScaleTransform
};
export default ForwardedPixiText;
