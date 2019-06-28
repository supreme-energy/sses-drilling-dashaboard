import React, { useState, useEffect } from "react";
import { useWebGLRenderer } from "../../../hooks/useWebGLRenderer";
import useRef from "react-powertools/hooks/useRef";
import WebGlContainer from "../../../components/WebGlContainer";
import { useSize } from "react-hook-size";
import classNames from "classnames";
import css from "./styles.scss";
import useViewport from "../../../hooks/useViewport";
import PixiContainer from "../../../components/PixiContainer";
import Grid from "../../../components/Grid";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiLine from "../../../components/PixiLine";

const gridGutter = 50;
const mapWellLog = d => [d.value, d.md];
export default function InterpretationChart({ className, controlLogs, logData }) {
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });
  const viewportContainer = useRef(null);

  const [view, updateView] = useState({
    x: gridGutter,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  useEffect(
    function initScale() {
      const minDepth = Math.min(...controlLogs.filter(l => l.data.length).map(l => l.data[0].md));

      updateView(view => ({ ...view, y: (-minDepth + 20) * view.yScale }));
    },
    [height, controlLogs]
  );

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: false,
    zoomYScale: true
  });

  useEffect(
    function moveToCurrentLog() {
      if (logData) {
        updateView(view => ({ ...view, y: -logData.data[0].md + 20 }));
      }
    },
    [logData]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, controlLogs]
  );

  return (
    <div className={classNames(className, css.root)}>
      <WebGlContainer ref={canvasRef} className={css.chart} />
      <PixiContainer ref={viewportContainer} container={stage} />
      {controlLogs.map(cl => (
        <PixiLine container={viewport} data={cl.data} mapData={mapWellLog} color={0x7e7d7e} />
      ))}
      {logData && <PixiLine container={viewport} data={logData.data} mapData={mapWellLog} color={0xee2211} />}
      <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} showXAxis={false} />
    </div>
  );
}

InterpretationChart.defaultProps = {
  controlLogs: [],
  logData: null
};
