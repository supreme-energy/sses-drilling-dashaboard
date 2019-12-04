import React, { useEffect, useCallback, useMemo } from "react";
import { selectionColor } from "../pixiColors";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiContainer from "../../../components/PixiContainer";
import {
  useSelectedSegmentState,
  usePendingSegments,
  useSelectedWellInfoColors,
  logDataExtent,
  getPendingSegmentsExtent,
  getFilteredLogsExtent,
  useSelectedWellLog,
  useComputedSegments
} from "../selectors";
import PixiLine from "../../../components/PixiLine";
import useDraggable from "../../../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";
import { useSaveWellLogActions, useUpdateWellLogs } from "../actions";
import { useComboContainer, initialLogBiasAndScale } from "../../ComboDashboard/containers/store";

import { hexColor } from "../../../constants/pixiColors";
import { withWellLogsData, EMPTY_ARRAY } from "../../../api";
import keyBy from "lodash/keyBy";
import { useInterpretationRenderer, gridGutter } from ".";
import * as PIXI from "pixi.js";

const lineData = [[0, 10], [0, 0]];

const BiasAndScale = React.memo(
  ({
    bias,
    scale,
    width,
    computedWidth,
    xMin,
    xMax,
    draftMode,
    saveSelectedWellLog,
    gridGutter,
    container,
    canvas,
    draftColor,
    y,
    onRootDragHandler,
    onStartDragHandler,
    onEndDragHandler,
    x
  }) => {
    const segmentContainerRef = useRef(null);
    const startLineRef = useRef(null);
    const endLineRef = useRef(null);

    const onDragEnd = useCallback(() => !draftMode && saveSelectedWellLog && saveSelectedWellLog(), [
      saveSelectedWellLog,
      draftMode
    ]);
    const getSegment = useCallback(() => segmentContainerRef.current && segmentContainerRef.current.container, []);

    useDraggable({
      getContainer: getSegment,
      root: container,
      onDrag: onRootDragHandler,
      onDragEnd,
      canvas,
      cursor: "ew-resize",
      width: computedWidth - 4,
      height: 8,
      x: 4,
      y: 0
    });

    const getSegmentStart = useCallback(() => startLineRef.current && startLineRef.current.container, []);

    useDraggable({
      getContainer: getSegmentStart,
      root: container,
      onDrag: onStartDragHandler,
      onDragEnd,
      canvas,
      cursor: "col-resize",
      width: 3,
      x: -1,
      y: 0,
      height: 10
    });

    const getSegmentEnd = useCallback(() => endLineRef.current && endLineRef.current.container, []);

    useDraggable({
      getContainer: getSegmentEnd,
      root: container,
      onDrag: onEndDragHandler,
      onDragEnd,
      canvas,
      cursor: "col-resize",
      width: 3,
      x: 0,
      y: 0,
      height: 10
    });

    return (
      <PixiContainer
        container={container}
        x={x}
        y={y}
        child={container => (
          <React.Fragment>
            <PixiContainer
              ref={startLineRef}
              container={container}
              x={0}
              y={-1}
              child={container => (
                <PixiLine
                  container={container}
                  data={lineData}
                  color={draftMode ? draftColor : selectionColor}
                  nativeLines={false}
                  lineWidth={2}
                />
              )}
            />
            <PixiContainer
              ref={endLineRef}
              container={container}
              x={computedWidth}
              y={-1}
              child={container => (
                <PixiLine
                  container={container}
                  data={lineData}
                  color={draftMode ? draftColor : selectionColor}
                  nativeLines={false}
                  lineWidth={2}
                />
              )}
            />

            <PixiContainer
              ref={segmentContainerRef}
              container={container}
              x={0}
              y={0}
              child={container => (
                <PixiRectangle
                  width={computedWidth - 2}
                  height={8}
                  radius={5}
                  backgroundColor={draftMode ? draftColor : selectionColor}
                  container={container}
                />
              )}
            />
          </React.Fragment>
        )}
      />
    );
  }
);

const useCalculatePositions = props => {
  const result = props.data.result;
  const { view } = useInterpretationRenderer();
  const [, , , extentsByTableName] = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const [{ logsBiasAndScale }] = useComboContainer();
  const { byId } = useComputedSegments();
  const { bias: parentLogBias, scale: parentLogScale } = logsBiasAndScale.wellLogs || { bias: 0, scale: 1 };

  return {
    toGlobal: (logId, p, getParentScale, x, globalX) => {
      const segmentData = byId[logId] || { scalebias: 0, scalefactor: 1 };
      let bias = Number(segmentData.scalebias);
      let scale = Number(segmentData.scalefactor);

      const extent = (extentsByTableName && extentsByTableName[segmentData.tablename]) || [0, 0];
      if (getParentScale) {
        return (globalX - (extent[0] + bias + gridGutter + parentLogBias)) / ((x - extent[0]) * scale);
      }
      return [
        ((p[0] - extent[0]) * scale * parentLogScale + extent[0] + bias + parentLogBias) * view.xScale + view.x,
        p[1]
      ];
    },
    computeParentScale: (logId, localX, globalX) => {
      const segmentData = byId[logId] || { scalebias: 0, scalefactor: 1 };
      let bias = Number(segmentData.scalebias);
      let scale = Number(segmentData.scalefactor);

      const extent = (extentsByTableName && extentsByTableName[segmentData.tablename]) || [0, 0];
      return (globalX - (extent[0] + bias + gridGutter + parentLogBias)) / ((localX - extent[0]) * scale);
    }
  };
};

function useSegmentBiasAndScale({
  container,
  y,
  gridGutter,

  canvas,
  totalWidth,
  toGlobal,
  logs,
  data: { result }
}) {
  const [{ draftMode, selectionById }] = useComboContainer();
  const segmentData = useSelectedSegmentState();
  const { selectedWellLog } = useSelectedWellLog();

  let bias = Number(segmentData.scalebias);
  let scale = Number(segmentData.scalefactor);
  const pendingSegments = usePendingSegments();
  const [, , , extentsByTableName] = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const parentExtent = getFilteredLogsExtent(logs, extentsByTableName).extentWithBiasAndScale;

  const { extent } = getPendingSegmentsExtent(pendingSegments, extentsByTableName);
  const internalState = useRef({ prevDraftSelection: selectionById });

  let [xMin, xMax] = extent;
  const updateSegments = useUpdateWellLogs();
  const colors = useSelectedWellInfoColors();
  const draftColor = hexColor(colors.draftcolor);
  const width = xMax - xMin;

  const [x1] = toGlobal(segmentData.id, [xMin, 0]);
  const [x2] = toGlobal(segmentData.id, [xMax, 0]);
  const computedWidth = x2 - x1;

  const updatePendingSegments = useCallback(
    props => {
      const propsById = pendingSegments.reduce((acc, s) => {
        acc[s.id] = props;
        return acc;
      }, {});
      updateSegments(propsById);
    },
    [pendingSegments, updateSegments]
  );
  const { saveSelectedWellLog } = useSaveWellLogActions();

  useEffect(
    function setInitialBiasAndScale() {
      if (
        draftMode &&
        selectedWellLog &&
        internalState.current.prevDraftSelection !== selectionById &&
        !Number.isNaN(parseFloat(xMax))
      ) {
        let initialBias = totalWidth - xMax - gridGutter - 10;
        if (initialBias === bias) {
          initialBias = bias - computedWidth;
        }

        updatePendingSegments({
          bias: initialBias,
          scale: 1
        });

        internalState.current.prevDraftSelection = selectionById;
      }
    },
    [
      computedWidth,
      totalWidth,
      gridGutter,
      xMax,
      draftMode,
      selectionById,
      updatePendingSegments,
      bias,
      selectedWellLog
    ]
  );

  useEffect(() => {
    if (!draftMode) {
      internalState.current.prevDraftSelection = null;
    }
  }, [draftMode]);

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;
      updatePendingSegments({ bias: bias + delta });
    },
    [updatePendingSegments, bias]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse, initialPosition) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale - delta;
      const newScale = newWidth / width;

      updatePendingSegments({ bias: bias + delta, scale: newScale });
    },
    [updatePendingSegments, bias, width, scale]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse, initialMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale + delta;
      const newScale = newWidth / width;
      updatePendingSegments({ scale: newScale });
    },
    [updatePendingSegments, width, scale]
  );

  return {
    bias: bias,
    scale,
    width,
    computedWidth,
    xMin,
    xMax,
    parentExtent,
    draftMode,
    saveSelectedWellLog,
    gridGutter,
    container,
    canvas,
    draftColor,
    y,
    x: x1,
    onRootDragHandler,
    onStartDragHandler,
    onEndDragHandler
  };
}

function useLogsBiasAndScaleProps({
  container,
  canvas,
  logsBiasAndScale,
  currentEditedLog,
  controlLogs,
  dispatch,
  logs,
  y,
  gridGutter,
  toGlobal,
  computeParentScale,
  data: { result }
}) {
  const controlLogsById = useMemo(() => keyBy(controlLogs, "id"), [controlLogs]);

  const logsGammaExtent = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const [, , , extentsByTableName] = logsGammaExtent;

  const { extentWithBiasAndScale, extent } = useMemo(() => {
    if (!currentEditedLog) {
      return { extentWithBiasAndScale: [], extent: [] };
    }

    if (currentEditedLog === "wellLogs") {
      return getFilteredLogsExtent(logs, extentsByTableName);
    }
    const extent = logDataExtent(controlLogsById[currentEditedLog].data);
    return {
      extent,
      extentWithBiasAndScale: []
    };
  }, [controlLogsById, logs, currentEditedLog, extentsByTableName]);

  const [minLogId, maxLogId] = extentWithBiasAndScale;
  const [xMin, xMax] = extent;
  const { bias, scale } = logsBiasAndScale[currentEditedLog] || initialLogBiasAndScale;
  const width = xMax - xMin;

  const [x1] = toGlobal(minLogId, [xMin, 0]);
  const [x2] = toGlobal(maxLogId, [xMax, 0]);

  const computedWidth = x2 - x1;

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;
      dispatch({ type: "UPDATE_LOG_BIAS_AND_SCALE", bias: bias + delta, logId: currentEditedLog });
    },
    [bias, dispatch, currentEditedLog]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;
      const newScale = computeParentScale(maxLogId, xMax, x2 - delta);

      dispatch({
        type: "UPDATE_LOG_BIAS_AND_SCALE",
        scale: newScale,
        bias: bias + delta,
        logId: currentEditedLog
      });
    },
    [dispatch, currentEditedLog, computeParentScale, maxLogId, xMax, x2, bias]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const newScale = computeParentScale(maxLogId, xMax, currMouse.x);

      dispatch({
        type: "UPDATE_LOG_BIAS_AND_SCALE",
        scale: newScale,
        logId: currentEditedLog
      });
    },
    [dispatch, currentEditedLog, maxLogId, computeParentScale, xMax]
  );

  return {
    container,
    canvas,
    bias,
    scale,
    xMin,
    xMax,
    logXMin: xMin,
    onRootDragHandler,
    y,
    x: x1,
    computedWidth,
    width,
    gridGutter,
    onStartDragHandler,
    onEndDragHandler
  };
}

function BiasAndScaleContainer(props) {
  const [{ currentEditedLog }] = useComboContainer();
  const { toGlobal, computeParentScale } = useCalculatePositions(props);
  return currentEditedLog ? (
    <LogBiasAndScale {...props} toGlobal={toGlobal} computeParentScale={computeParentScale} />
  ) : (
    <SegmentBiasAndScale {...props} toGlobal={toGlobal} />
  );
}

const LogBiasAndScale = props => {
  const [{ currentEditedLog, logsBiasAndScale }, dispatch] = useComboContainer();

  const logsBiasAndScaleProps = useLogsBiasAndScaleProps({ ...props, logsBiasAndScale, currentEditedLog, dispatch });
  return <BiasAndScale {...logsBiasAndScaleProps} />;
};

const SegmentBiasAndScale = props => {
  const [{ logsBiasAndScale }] = useComboContainer();
  const segmentBiasAndScaleProps = useSegmentBiasAndScale({ ...props, logsBiasAndScale });
  return <BiasAndScale {...segmentBiasAndScaleProps} />;
};

export default withWellLogsData(BiasAndScaleContainer);
