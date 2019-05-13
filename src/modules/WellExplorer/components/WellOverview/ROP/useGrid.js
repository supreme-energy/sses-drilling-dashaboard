import useRef from "react-powertools/hooks/useRef";
import { useEffect, useMemo } from "react";
import { drawGrid } from "../../../../ComboDashboard/components/CrossSection/drawGrid";

export default function useGrid({ container, width, height, gridGutter }) {
  const gridLayerRef = useRef(() => new PIXI.Container());

  useEffect(() => {
    const gridLayer = gridLayerRef.current;
    container.addChild(gridLayer);

    return () => container.removeChild(gridLayer);
  }, [container]);

  const gridUpdate = useMemo(() => {
    return drawGrid(gridLayerRef.current, width, height, gridGutter);
  }, [width, height, gridGutter]);

  return [gridLayerRef.current, gridUpdate];
}
