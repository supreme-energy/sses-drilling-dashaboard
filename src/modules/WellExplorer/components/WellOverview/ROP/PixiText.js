import { useEffect, useImperativeHandle, forwardRef } from "react";
import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";

function PixiText({ container, fontSize, color, x, y, text }, ref) {
  const textRef = useRef(() => new PIXI.Text(""));
  useEffect(
    function addText() {
      const pixiText = textRef.current;
      pixiText.transform.updateTransform = frozenScaleTransform;
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

      pixiText.text = text;
      pixiText.style.fontSize = fontSize;
      pixiText.style.fill = color;
    },
    [x, y, text, fontSize, color]
  );

  useImperativeHandle(ref, () => ({
    pixiText: textRef.current
  }));

  return null;
}

const ForwardedPixiText = forwardRef(PixiText);
ForwardedPixiText.defaultProps = {
  x: 0,
  y: 0
};
export default ForwardedPixiText;
