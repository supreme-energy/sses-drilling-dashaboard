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
import Segments from "./Segments";
import { defaultMakeYTickAndLine } from "../../ComboDashboard/components/CrossSection/drawGrid";
import { createContainer } from "unstated-next";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenXYTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useSelectedWellLog, useCurrentComputedSegments, useSelectedWellInfoColors } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import BiasAndScale from "./BiasAndScale";
import * as PIXI from "pixi.js";
import TCLLine from "./TCLLine";
import Formations from "./Formations";
import LogLines from "../LogLines";
import { min } from "d3-array";
import ControlLogLine from "./ControlLogLine";
import { useFormationsStore } from "./Formations/store";
const gridGutter = 65;

function createGridYAxis(...args) {
  const [line, label] = defaultMakeYTickAndLine(...args);
  label.x = 15;
  return [line, label];
}

function useInterpretationWebglRenderer() {
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  useEffect(refresh, [refresh, width, height]);

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
    zoomYScale: true,
    updateViewport: false
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
    viewportContainer,
    viewport,
    canvasRef,
    size: { width, height },
    view,
    updateView
  } = useInterpretationRenderer();

  const { selectedWellLog, selectedWellLogIndex } = useSelectedWellLog();

  const internalStateRef = useRef({ scaleInitialized: false });
  const {
    current: { scaleInitialized }
  } = internalStateRef;
  const [segments] = useCurrentComputedSegments(wellId);

  // scroll to the start of the control log
  useEffect(
    function initScale() {
      if (!scaleInitialized && controlLogs && controlLogs.length) {
        const minDepth = min(controlLogs, cl => cl.data[0].md);
        updateView(view => ({ ...view, y: (-minDepth + 20) * view.yScale }));
        internalStateRef.current.scaleInitialized = true;
      }
    },
    [height, controlLogs, updateView, scaleInitialized]
  );

  useEffect(
    function updateViewport() {
      if (updateView) {
        viewport.position = new PIXI.Point(view.x, view.y);
        viewport.scale.x = view.xScale;
        viewport.scale.y = view.yScale;
      }
    },
    [view, viewport, updateView]
  );

  const [
    {
      surveyVisibility,
      surveyPrevVisibility,
      draftMode,
      pendingSegmentsState,
      nrPrevSurveysToDraft,
      currentEditedLog,
      logsBiasAndScale,
      colorsByWellLog
    }
  ] = useComboContainer();

  const [{ editMode: formationsEditMode }] = useFormationsStore();

  const colors = useSelectedWellInfoColors();

  useEffect(refresh, [
    refresh,
    stage,
    controlLogs,
    selectedWellLog,
    gr,
    segments,
    view,
    viewport,
    surveyVisibility,
    surveyPrevVisibility,
    nrPrevSurveysToDraft,
    draftMode,
    pendingSegmentsState,
    colors,
    currentEditedLog,
    logsBiasAndScale,
    colorsByWellLog,
    logsBiasAndScale,
    formationsEditMode
  ]);

  return (
    <div className={classNames(className, css.root)}>
      <WebGlContainer ref={canvasRef} className={css.chart} />
      <PixiContainer ref={viewportContainer} container={stage} />
      <Formations container={viewport} width={width} view={view} gridGutter={gridGutter} />

      {controlLogs.map(cl => (
        <ControlLogLine key={cl.id} log={cl} container={viewport} />
      ))}
      <LogLines
        wellId={wellId}
        logs={logList}
        container={viewport}
        selectedWellLogIndex={selectedWellLogIndex}
        offset={gridGutter}
      />

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
      {!formationsEditMode && (
        <Segments container={viewport} chartWidth={width} segmentsData={segments} selectedWellLog={selectedWellLog} />
      )}
      <TCLLine container={viewport} width={width} />
      <PixiRectangle width={width} height={12} backgroundColor={0xffffff} container={stage} y={height - 12} />
      {!formationsEditMode && (
        <BiasAndScale
          controlLogs={controlLogs}
          logs={logList}
          wellId={wellId}
          container={stage}
          y={height - 10}
          gridGutter={gridGutter}
          refresh={refresh}
          totalWidth={width}
          canvas={canvasRef.current}
        />
      )}
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
