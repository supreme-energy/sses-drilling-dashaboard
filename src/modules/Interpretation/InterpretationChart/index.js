import React, { useEffect, useState, useCallback } from "react";
import { useWebGLRenderer } from "../../../hooks/useWebGLRenderer";
import useRef from "react-powertools/hooks/useRef";
import WebGlContainer from "../../../components/WebGlContainer";
import { useSize } from "react-hook-size";
import usePrevious from "react-use/lib/usePrevious";
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
import Formations from "./Formations";
import LogLines from "../LogLines";
import { min } from "d3-array";
import ControlLogLine from "./ControlLogLine";
import { useFormationsStore } from "./Formations/store";
import get from "lodash/get";
import { useLocalStorageState } from "react-storage-hooks";
import { useWellIdContainer } from "../../App/Containers";

export const gridGutter = 65;
const initialViewState = {
  x: gridGutter,
  y: 0,
  xScale: 1,
  yScale: 1
};

function createGridYAxis(...args) {
  const [line, label] = defaultMakeYTickAndLine(...args);
  label.x = 15;
  return [line, label];
}

function useInterpretationWebglRenderer() {
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setCanvas(canvasRef.current);
  }, []);
  const { width, height } = useSize(canvasRef);

  const [stage, refresh, renderer] = useWebGLRenderer({ canvas, width, height });

  useEffect(refresh, [refresh, width, height]);

  const { wellId } = useWellIdContainer();
  const [view, updateView] = useLocalStorageState(`${wellId}Interpretation`, initialViewState);

  const viewportContainer = useRef(null);
  const topContainerRef = useRef(null);

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
    viewportContainer,
    topContainerRef
  };
}

export const { Provider: WebglRendererProvider, useContainer: useInterpretationRenderer } = createContainer(
  useInterpretationWebglRenderer
);

function InterpretationChart({ className, controlLogs, gr, logList, wellId, centerSelectedLogId }) {
  const {
    stage,
    refresh,
    viewportContainer,
    viewport,
    canvasRef,
    size: { width, height },
    view,
    updateView,
    topContainerRef
  } = useInterpretationRenderer();

  const { selectedWellLog, selectedWellLogIndex } = useSelectedWellLog();

  const internalStateRef = useRef({ scaleInitialized: false, prevResetCounter: null });
  const {
    current: { scaleInitialized }
  } = internalStateRef;
  const [segments] = useCurrentComputedSegments(wellId);
  const prevCenteredSelectedLogId = usePrevious(centerSelectedLogId);

  // scroll to the start of the control log
  useEffect(
    function initScale() {
      if (view.y !== 0 || view.yScale !== 1) {
        internalStateRef.current.scaleInitialized = true;
      } else if (!scaleInitialized && controlLogs && controlLogs.length) {
        const minDepth = min(controlLogs, cl => get(cl, "data[0].md"));

        updateView(view => ({ ...view, y: (-minDepth + 20) * view.yScale }));
        internalStateRef.current.scaleInitialized = true;
      }
    },
    [height, controlLogs, updateView, scaleInitialized, view]
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
      colorsByWellLog,
      resetViewportCounter
    }
  ] = useComboContainer();

  const [{ editMode: formationsEditMode }] = useFormationsStore();

  const colors = useSelectedWellInfoColors();

  useEffect(() => {
    if (resetViewportCounter && selectedWellLog && internalStateRef.current.prevResetCounter !== resetViewportCounter) {
      const yMin = Math.floor((-1 * view.y) / view.yScale);
      const yMax = yMin + Math.floor((height + view.yScale) / view.yScale);
      internalStateRef.current.prevResetCounter = resetViewportCounter;

      if (selectedWellLog.startdepth < yMin || selectedWellLog.enddepth > yMax) {
        const y = -selectedWellLog.enddepth * view.yScale + ((yMax - yMin) / 2) * view.yScale;
        updateView(view => ({ ...view, y }));
      }
    }
  }, [resetViewportCounter, selectedWellLog, view, height, updateView]);

  useEffect(() => {
    if (selectedWellLog && height && centerSelectedLogId !== prevCenteredSelectedLogId) {
      const { startdepth, enddepth } = selectedWellLog;
      const gutter = 25;
      const adjustedHeight = (height - gutter) * 0.9;
      const yScale = adjustedHeight / Math.abs(enddepth - startdepth);
      const y = -startdepth * yScale + gutter;
      updateView(view => ({ ...view, y, yScale }));
    }
  }, [selectedWellLog, height, updateView, centerSelectedLogId, prevCenteredSelectedLogId]);

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
    formationsEditMode,
    resetViewportCounter
  ]);

  return (
    <div className={classNames(className, css.root)}>
      <WebGlContainer ref={canvasRef} className={css.chart} />
      <PixiContainer ref={viewportContainer} container={stage} />
      <Formations container={viewport} width={width} gridGutter={gridGutter} />

      {!formationsEditMode && (
        <React.Fragment>
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
        </React.Fragment>
      )}

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
      <PixiContainer ref={topContainerRef} container={viewport} />
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
