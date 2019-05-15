import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { drawGrid, defaultMakeXTickAndLine } from "../../../../ComboDashboard/components/CrossSection/drawGrid";

function makeXTickAndLine(...args) {
  const [line, label] = defaultMakeXTickAndLine(...args);
  label.rotation = 0;
  const [, , index] = args;

  // this code is a bit fragile but it was the fastest way to acheive custom anchor for first value
  if (index === 1) {
    label.anchor.set(0, 0.5);
  } else {
    label.anchor.set(0.5, 0.5);
  }

  return [line, label];
}
function Grid({ container, width, height, gridGutter, x, y, view }, ref) {
  const gridLayerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const gridLayer = gridLayerRef.current;
    container.addChild(gridLayer);
    return () => container.removeChild(gridLayer);
  }, [container]);

  const updateGrid = useMemo(() => {
    return drawGrid(gridLayerRef.current, width, height, gridGutter, "top", makeXTickAndLine);
  }, [width, height, gridGutter]);

  useEffect(() => {
    updateGrid(view);
  }, [updateGrid, view]);

  useImperativeHandle(ref, () => ({
    updateGrid
  }));

  return null;
}

export default forwardRef(Grid);
