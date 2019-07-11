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
import Segments from "./Segments";
import { defaultMakeYTickAndLine } from "../../ComboDashboard/components/CrossSection/drawGrid";
import { createContainer } from "unstated-next";
import PixiRectangle from "../../../components/PixiRectangle";
import {
  frozenScaleTransform,
  frozenXYTransform
} from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useSelectedWellLog, useComputedSegments } from "../selectors";

const gridGutter = 60;

const mapControlLog = d => [d.value, d.md];

function createGridYAxis(...args) {
  const [line, label] = defaultMakeYTickAndLine(...args);
  label.x = 15;
  return [line, label];
}

function useInterpretationWebglRenderer() {
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const [view, updateView] = useState({
    x: gridGutter,
    y: 0,
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
    zoomYScale: true
  });

  return {
    stage,
    refresh,
    renderer,
    view,
    updateView,
    canvasRef,
    size: { width, height },
    viewport,
    viewportContainer
  };
}

export const { Provider: WebglRendererProvider, useContainer: useInterpretationRenderer } = createContainer(
  useInterpretationWebglRenderer
);

function InterpretationChart({ className, controlLogs, logData, gr, logList, wellId }) {
  const {
    stage,
    refresh,
    renderer,
    viewportContainer,
    viewport,
    canvasRef,
    size: { width, height },
    view,
    updateView
  } = useInterpretationRenderer();

  const { selectedWellLog } = useSelectedWellLog(wellId);

  useEffect(
    function initScale() {
      const minDepth = Math.min(...controlLogs.filter(l => l.data.length).map(l => l.data[0].md));

      updateView(view => ({ ...view, y: (-minDepth + 20) * view.yScale }));
    },
    [height, controlLogs, updateView]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, controlLogs, selectedWellLog, gr]
  );

  const segments = useComputedSegments(wellId);

  return (
    <div className={classNames(className, css.root)}>
      <WebGlContainer ref={canvasRef} className={css.chart} />
      <PixiContainer ref={viewportContainer} container={stage} />

      {controlLogs.map(cl => (
        <PixiLine key={cl.id} container={viewport} data={cl.data} mapData={mapControlLog} color={0x7e7d7e} />
      ))}
      {/* todo use this when add aditional logs
      {gr && gr.data && <PixiLine container={viewport} data={gr.data} mapData={mapGammaRay} color={0x0d0079} />} */}
      {logList.map((log, index) => (
        <LogDataLine
          log={log}
          prevLog={logList[index - 1]}
          key={log.id}
          wellId={wellId}
          container={viewport}
          selected={selectedWellLog && log.id === selectedWellLog.id}
        />
      ))}
      <Grid
        container={viewport}
        view={view}
        width={width}
        height={height}
        gridGutter={gridGutter}
        showXAxis={false}
        makeYTickAndLine={createGridYAxis}
      />
      <PixiRectangle
        width={10}
        height={height}
        updateTransform={frozenXYTransform}
        y={0}
        x={width - 10}
        backgroundColor={0xffffff}
        container={viewport}
      />
      <Segments container={viewport} chartWidth={width} segmentsData={segments} selectedWellLog={selectedWellLog} />
    </div>
  );
}

InterpretationChart.defaultProps = {
  controlLogs: [],
  logData: null
};

export default props => (
  <WebglRendererProvider>
    <InterpretationChart {...props} />
  </WebglRendererProvider>
);
