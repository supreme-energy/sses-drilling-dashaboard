import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { drawGrid, defaultMakeXTickAndLine } from "../../../../ComboDashboard/components/CrossSection/drawGrid";

function makeXTickAndLine(...args) {
  const [line, label] = defaultMakeXTickAndLine(...args);
  label.rotation = 0;

  return [line, label];
}
function Grid({ container, width, height, gridGutter, view }, ref) {
  const gridLayerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const gridLayer = gridLayerRef.current;
    container.addChild(gridLayer);
    return () => container.removeChild(gridLayer);
  }, [container]);

  const updateGrid = useMemo(() => {
    return drawGrid(gridLayerRef.current, { gridGutter, xAxisOrientation: "top", makeXTickAndLine, maxXLines: 10 });
  }, [gridGutter]);

  useEffect(() => {
    updateGrid({ view, width, height });
  }, [updateGrid, view, width, height]);

  useImperativeHandle(ref, () => ({
    updateGrid
  }));

  return null;
}

export default forwardRef(Grid);
