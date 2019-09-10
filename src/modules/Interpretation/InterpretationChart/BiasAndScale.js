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
  getFilteredLogsExtent
} from "../selectors";
import PixiLine from "../../../components/PixiLine";
import useDraggable from "../../../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";
import { useSaveWellLogActions, useUpdateSegmentsByMd } from "../actions";
import { useComboContainer, initialLogBiasAndScale } from "../../ComboDashboard/containers/store";

import { hexColor } from "../../../constants/pixiColors";
import { withWellLogsData, EMPTY_ARRAY } from "../../../api";
import keyBy from "lodash/keyBy";

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

function useSegmentBiasAndScale({
  container,
  y,
  gridGutter,
  refresh,
  canvas,
  totalWidth,
  logsBiasAndScale,
  logs,
  data: { result }
}) {
  const [{ draftMode }] = useComboContainer();
  const segmentData = useSelectedSegmentState();
  const { bias: logsBias, scale: logsScale } = logsBiasAndScale["wellLogs"] || initialLogBiasAndScale;
  let bias = Number(segmentData.scalebias);
  let scale = Number(segmentData.scalefactor);
  const pendingSegments = usePendingSegments();
  const [, , , extentsByTableName] = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const parentExtent = getFilteredLogsExtent(logs, extentsByTableName).extentWithBiasAndScale;

  const { extent, extentWithBiasAndScale } = getPendingSegmentsExtent(pendingSegments, extentsByTableName);

  let [xMin, xMax] = extent;
  const updateSegments = useUpdateSegmentsByMd();
  const colors = useSelectedWellInfoColors();
  const draftColor = hexColor(colors.draftcolor);

  const width = xMax - xMin;

  const computedWidth = xMax * scale * logsScale - xMin * scale * logsScale;

  const updatePendingSegments = useCallback(
    props => {
      const propsByMd = pendingSegments.reduce((acc, s) => {
        acc[s.endmd] = props;
        return acc;
      }, {});
      updateSegments(propsByMd);
    },
    [pendingSegments, updateSegments]
  );
  const { saveSelectedWellLog } = useSaveWellLogActions();

  const [min, max] = extentWithBiasAndScale;
  useEffect(
    function setInitialBiasAndScale() {
      if (draftMode) {
        updatePendingSegments({
          bias: Math.min(max - min - 10, totalWidth - computedWidth - gridGutter - 10 - xMin),
          scale: 1
        });
      }
    },
    [min, max, draftMode] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = (currMouse.x - prevMouse.x) / logsScale;
      updatePendingSegments({ bias: bias + delta });
    },
    [updatePendingSegments, bias, logsScale]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale - delta;
      const newScale = newWidth / width;

      updatePendingSegments({ bias: bias + delta / 2, scale: newScale });
    },
    [updatePendingSegments, width, bias, scale]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale + delta / logsScale;
      const newScale = newWidth / width;
      updatePendingSegments({ scale: newScale });
    },
    [updatePendingSegments, width, logsScale, scale]
  );

  const x = gridGutter + xMin + bias * logsScale + logsBias;

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
    x,
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
  data: { result }
}) {
  const controlLogsById = useMemo(() => keyBy(controlLogs, "id"), [controlLogs]);

  const logsGammaExtent = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const [, , , extentsByTableName] = logsGammaExtent;

  const currentExtent = useMemo(() => {
    if (!currentEditedLog) {
      return [];
    }

    return currentEditedLog === "wellLogs"
      ? getFilteredLogsExtent(logs, extentsByTableName).extentWithBiasAndScale
      : logDataExtent(controlLogsById[currentEditedLog].data);
  }, [controlLogsById, logs, currentEditedLog, extentsByTableName]);

  const [xMin, xMax] = currentExtent;

  const { bias, scale } = logsBiasAndScale[currentEditedLog] || initialLogBiasAndScale;

  const width = xMax - xMin;
  const computedWidth = width * scale;

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

      const newWidth = width * scale - delta;
      const newScale = newWidth / width;
      dispatch({ type: "UPDATE_LOG_BIAS_AND_SCALE", bias: bias + delta / 2, scale: newScale, logId: currentEditedLog });
    },
    [dispatch, bias, scale, currentEditedLog, width]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale + delta;
      const newScale = newWidth / width;
      dispatch({ type: "UPDATE_LOG_BIAS_AND_SCALE", scale: newScale, logId: currentEditedLog });
    },
    [dispatch, scale, currentEditedLog, width]
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
    x: bias + xMin + gridGutter,
    computedWidth,
    width,
    gridGutter,
    onStartDragHandler,
    onEndDragHandler
  };
}

function BiasAndScaleContainer(props) {
  const [{ currentEditedLog }] = useComboContainer();
  return currentEditedLog ? <LogBiasAndScale {...props} /> : <SegmentBiasAndScale {...props} />;
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
