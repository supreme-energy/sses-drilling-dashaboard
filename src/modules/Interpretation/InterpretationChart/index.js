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
import PixiLine from "../../../components/PixiLine";
import LogDataLine from "./LogDataLine";

const gridGutter = 50;

const mapControlLog = d => [d.value, d.md];

export default function InterpretationChart({ className, controlLogs, logData, gr, logList, wellId, selectedWellLog }) {
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
      if (selectedWellLog) {
        updateView(view => ({ ...view, y: -selectedWellLog.startdepth * view.yScale }));
      }
    },
    [selectedWellLog]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, controlLogs, selectedWellLog, gr]
  );

  return (
    <div className={classNames(className, css.root)}>
      <WebGlContainer ref={canvasRef} className={css.chart} />
      <PixiContainer ref={viewportContainer} container={stage} />
      {controlLogs.map(cl => (
        <PixiLine key={cl.id} container={viewport} data={cl.data} mapData={mapControlLog} color={0x7e7d7e} />
      ))}
      {/* todo use this when add aditional logs
      {gr && gr.data && <PixiLine container={viewport} data={gr.data} mapData={mapGammaRay} color={0x0d0079} />} */}
      {logList.map(log => (
        <LogDataLine
          log={log}
          key={log.id}
          wellId={wellId}
          container={viewport}
          selected={selectedWellLog && log.id === selectedWellLog.id}
        />
      ))}
      <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} showXAxis={false} />
    </div>
  );
}

InterpretationChart.defaultProps = {
  controlLogs: [],
  logData: null
};
