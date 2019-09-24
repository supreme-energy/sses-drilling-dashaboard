import useRef from "react-powertools/hooks/useRef";
import * as PIXI from "pixi.js";
import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { drawGrid } from "../modules/ComboDashboard/components/CrossSection/drawGrid";

const Grid = forwardRef(
  (
    { container, width, height, gridGutter, view, fontSize, showXAxis, showYAxis, makeXTickAndLine, makeYTickAndLine },
    ref
  ) => {
    const gridLayerRef = useRef(() => new PIXI.Container());

    useEffect(() => {
      const gridLayer = gridLayerRef.current;
      container.addChild(gridLayer);
      return () => container.removeChild(gridLayer);
    }, [container]);

    const updateGrid = useMemo(() => {
      return drawGrid(gridLayerRef.current, {
        gutter: gridGutter,
        fontSize,
        xAxisOrientation: "top",
        makeXTickAndLine,
        makeYTickAndLine,
        showXAxis,
        showYAxis,
        maxXLines: 10
      });
    }, [gridGutter, showXAxis, showYAxis, fontSize, makeXTickAndLine, makeYTickAndLine]);

    useEffect(() => {
      updateGrid({ view, width, height });
    }, [updateGrid, view, width, height]);

    useImperativeHandle(ref, () => ({
      updateGrid
    }));

    return null;
  }
);

Grid.defaultProps = {
  fontSize: 13
};

export default Grid;
