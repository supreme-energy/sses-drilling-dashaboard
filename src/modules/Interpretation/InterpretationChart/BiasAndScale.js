import React, { useEffect, useCallback, useMemo } from "react";
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
  useComputedSegments,
  getColorForWellLog
} from "../selectors";
import PixiLine from "../../../components/PixiLine";
import useDraggable from "../../../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";
import { useSaveWellLogActions, useUpdateWellLogs } from "../actions";
import { useComboContainer, initialLogBiasAndScale } from "../../ComboDashboard/containers/store";

import { hexColor } from "../../../constants/pixiColors";
import { withWellLogsData, EMPTY_ARRAY } from "../../../api";
import keyBy from "lodash/keyBy";
import { useInterpretationRenderer } from ".";

const lineData = [[0, 10], [0, 0]];

const BiasAndScale = React.memo(
  ({
    computedWidth,
    draftMode,
    saveSelectedWellLog,
    currentEditedLog,
    container,
    canvas,
    draftColor,
    y,
    onRootDragHandler,
    onStartDragHandler,
    onEndDragHandler,
    colorsByWellLog,
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
    const colors = useSelectedWellInfoColors();
    const wellLogColor = Number(`0x${getColorForWellLog(colorsByWellLog, currentEditedLog)}`);
    const color = draftMode ? draftColor : currentEditedLog ? wellLogColor : hexColor(colors.selectedsurveycolor);
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
                <PixiLine container={container} data={lineData} color={color} nativeLines={false} lineWidth={2} />
              )}
            />
            <PixiContainer
              ref={endLineRef}
              container={container}
              x={computedWidth}
              y={-1}
              child={container => (
                <PixiLine container={container} data={lineData} color={color} nativeLines={false} lineWidth={2} />
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
                  backgroundColor={color}
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

const useCalculatePositions = (props, currentEditedLog) => {
  const result = props.data.result;
  const { view } = useInterpretationRenderer();
  const [, , , extentsByTableName] = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const [{ logsBiasAndScale }] = useComboContainer();
  const { byId } = useComputedSegments();
  const { bias: parentLogBias, scale: parentLogScale } = logsBiasAndScale[currentEditedLog || "wellLogs"] || {
    bias: 0,
    scale: 1
  };

  if (!currentEditedLog || currentEditedLog === "wellLogs") {
    return {
      toGlobal: (logId, p) => {
        const segmentData = byId[logId] || { scalebias: 0, scalefactor: 1 };
        let bias = Number(segmentData.scalebias);
        let scale = Number(segmentData.scalefactor);

        const extent = (extentsByTableName && extentsByTableName[segmentData.tablename]) || [0, 0];

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
        // this is obtained by replacing localX and globalX in the toGlobal calculation and resolve parentLogScale
        return ((globalX - view.x) / view.xScale - extent[0] - bias - parentLogBias) / scale / (localX - extent[0]);
      }
    };
  }

  return {
    toGlobal: (_, p) => [(p[0] * parentLogScale + parentLogBias) * view.xScale + view.x, p[1]],
    computeParentScale: (logId, localX, globalX) => ((globalX - view.x) / view.xScale - parentLogBias) / localX
  };
};

function useSegmentBiasAndScale({
  container,
  y,
  gridGutter,
  logsBiasAndScale,
  canvas,
  totalWidth,
  toGlobal,
  logs,
  data: { result }
}) {
  const [{ draftMode, selectionById }] = useComboContainer();
  const segmentData = useSelectedSegmentState();
  const { selectedWellLog } = useSelectedWellLog();
  const {
    view: { xScale }
  } = useInterpretationRenderer();

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
  const { scale: parentLogScale } = logsBiasAndScale["wellLogs"] || {
    bias: 0,
    scale: 1
  };

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
      const delta = (currMouse.x - prevMouse.x) / xScale;
      updatePendingSegments({ bias: bias + delta });
    },
    [updatePendingSegments, bias, xScale]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse, initialPosition) => {
      const currMouse = event.data.global;
      const delta = (currMouse.x - prevMouse.x) / xScale / parentLogScale;

      const newWidth = width * scale - delta;
      const newScale = newWidth / width;

      updatePendingSegments({ bias: bias + delta * parentLogScale, scale: newScale });
    },
    [updatePendingSegments, bias, width, scale, parentLogScale, xScale]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse, initialMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale + delta / xScale / parentLogScale;
      const newScale = newWidth / width;
      updatePendingSegments({ scale: newScale });
    },
    [updatePendingSegments, width, scale, xScale, parentLogScale]
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
  const {
    view: { xScale }
  } = useInterpretationRenderer();
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

  const [, , minLogId, maxLogId] = extentWithBiasAndScale;
  const [xMin, xMax] = extent;
  const { bias, scale } = logsBiasAndScale[currentEditedLog] || initialLogBiasAndScale;
  const width = xMax - xMin;

  const [x1] = toGlobal(minLogId, [xMin, 0]);
  const [x2] = toGlobal(maxLogId, [xMax, 0]);

  const computedWidth = x2 - x1;

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = (currMouse.x - prevMouse.x) / xScale;
      dispatch({ type: "UPDATE_LOG_BIAS_AND_SCALE", bias: bias + delta, logId: currentEditedLog });
    },
    [bias, dispatch, currentEditedLog, xScale]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;
      const newScale = computeParentScale(maxLogId, xMax, x2 - delta);

      dispatch({
        type: "UPDATE_LOG_BIAS_AND_SCALE",
        scale: newScale,
        bias: bias + delta / xScale,
        logId: currentEditedLog
      });
    },
    [dispatch, currentEditedLog, computeParentScale, maxLogId, xMax, bias, x2, xScale]
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
  const [{ currentEditedLog, colorsByWellLog, logsBiasAndScale }, dispatch] = useComboContainer();
  const storeProps = { currentEditedLog, colorsByWellLog, logsBiasAndScale, dispatch };

  const { toGlobal, computeParentScale } = useCalculatePositions(props, currentEditedLog);
  return currentEditedLog ? (
    <LogBiasAndScale {...props} {...storeProps} toGlobal={toGlobal} computeParentScale={computeParentScale} />
  ) : (
    <SegmentBiasAndScale {...storeProps} {...props} toGlobal={toGlobal} />
  );
}

const LogBiasAndScale = props => {
  const logsBiasAndScaleProps = useLogsBiasAndScaleProps(props);
  return <BiasAndScale {...props} {...logsBiasAndScaleProps} />;
};

const SegmentBiasAndScale = props => {
  const segmentBiasAndScaleProps = useSegmentBiasAndScale(props);
  return <BiasAndScale {...props} {...segmentBiasAndScaleProps} />;
};

export default withWellLogsData(BiasAndScaleContainer);
