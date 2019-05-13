import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { drawGrid } from "../../../../ComboDashboard/components/CrossSection/drawGrid";

function Grid({ container, width, height, gridGutter, x, y }, ref) {
  const gridLayerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const gridLayer = gridLayerRef.current;
    container.addChild(gridLayer);
    return () => container.removeChild(gridLayer);
  }, [container]);

  const updateGrid = useMemo(() => {
    return drawGrid(gridLayerRef.current, width, height, gridGutter, "top");
  }, [width, height, gridGutter]);

  useImperativeHandle(ref, () => ({
    updateGrid
  }));

  return null;
}

export default forwardRef(Grid);
