import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";

import useRef from "react-powertools/hooks/useRef";

import { useWellOverviewKPI } from "../../../../api";
import { useFilteredAdditionalDataInterval } from "../../../App/Containers";
import WidgetCard from "../../../../components/WidgetCard";
import PixiCircle from "../../../../components/PixiCircle";
import PixiArc from "../../../../components/PixiArc";
import PixiTriangle from "../../../../components/PixiTriangle";
import PixiContainer from "../../../../components/PixiContainer";
import useViewport from "../../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import { CURVE } from "../../../../constants/wellSections";

import classes from "./ToolFace.scss";

const gridGutter = 50;
const RADIUS = 50;
const OFFSET = Math.PI / 2;
const degreeToRadian = deg => (deg * Math.PI) / 180;

function ToolFace({ wellId }) {
  // Get tool face efficiency
  const { bySegment } = useWellOverviewKPI(wellId);
  // Get GTF data
  const { data = [] } = useFilteredAdditionalDataInterval(wellId, 29);

  const tfEfficiency = useMemo(() => bySegment.get(CURVE) && bySegment.get(CURVE)[0].toolFaceEfficiency, [bySegment]);
  const toolFaceHistory = useMemo(() => data.slice(data.length - 6, data.length), [data]);

  const startAngle = degreeToRadian(-tfEfficiency - 20) + OFFSET;
  const endAngle = degreeToRadian(-tfEfficiency + 20) + OFFSET;
  const startArc = degreeToRadian(tfEfficiency + 20) - OFFSET;
  const endArc = degreeToRadian(tfEfficiency - 20) - OFFSET;

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const [view, updateView] = useState({
    x: gridGutter,
    y: gridGutter,
    xScale: 1,
    yScale: 1
  });

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: false,
    zoomYScale: false
  });

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, tfEfficiency, toolFaceHistory, view, width, height]
  );

  return (
    <WidgetCard className={classes.toolFaceContainer} title="Tool Face" hideMenu>
      <div className={classes.plot} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        <PixiCircle container={viewport} x={0} y={0} radius={RADIUS} backgroundColor={0xd7d7d7} />
        <PixiArc
          container={viewport}
          x={0}
          y={0}
          radius={RADIUS}
          startAngle={startArc}
          endAngle={endArc}
          backgroundColor={0x60a625}
        />
        <PixiTriangle
          container={viewport}
          x={0}
          y={0}
          radius={RADIUS}
          startAngle={startAngle}
          endAngle={endAngle}
          offset={OFFSET}
          backgroundColor={0x60a625}
        />
        {toolFaceHistory.map((r, index) => {
          const radians = degreeToRadian(r.value) - OFFSET;
          const x = (RADIUS - (index + 1) * 6) * Math.cos(radians);
          const y = (RADIUS - (index + 1) * 6) * Math.sin(radians);
          return (
            <PixiTriangle
              key={index}
              container={viewport}
              x={x}
              y={y}
              radius={6}
              startAngle={0}
              endAngle={Math.PI / 2}
              backgroundColor={0xffffff}
            />
          );
        })}
      </div>
    </WidgetCard>
  );
}

ToolFace.propTypes = {
  wellId: PropTypes.string
};

export default ToolFace;
