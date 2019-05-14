import { useEffect, useImperativeHandle, forwardRef } from "react";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";

function PixiText({ container, fontSize, color, x, y, text, anchor, updateTransform }, ref) {
  const textRef = useRef(() => new PIXI.Text(""));
  useEffect(
    function addText() {
      const pixiText = textRef.current;
      container.addChild(pixiText);
      return () => container.removeChild(pixiText);
    },
    [container]
  );

  useEffect(
    function reposition() {
      const pixiText = textRef.current;
      pixiText.x = x;
      pixiText.y = y;
    },
    [x, y]
  );

  useEffect(
    function updateText() {
      const pixiText = textRef.current;
      if (updateTransform) {
        pixiText.transform.updateTransform = updateTransform;
      }

      pixiText.anchor.set(...anchor);
      pixiText.text = text;
      pixiText.style.fontSize = fontSize;
      pixiText.style.fill = color;
    },
    [x, y, text, fontSize, color, anchor, updateTransform]
  );

  useImperativeHandle(ref, () => ({
    pixiText: textRef.current
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
