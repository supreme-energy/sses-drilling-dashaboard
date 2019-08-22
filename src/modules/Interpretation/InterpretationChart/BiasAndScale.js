import React, { useEffect, useCallback, useState } from "react";
import { draftColor, selectionColor } from "../pixiColors";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiContainer from "../../../components/PixiContainer";
import { useSelectedSegmentState, useLogExtent, usePendingSegments } from "../selectors";
import PixiLine from "../../../components/PixiLine";
import useDraggable from "../../../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";
import { useBiasAndScaleActions, useSaveWellLogActions } from "../actions";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { useWellIdContainer } from "../../App/Containers";

const lineData = [[0, 10], [0, 0]];

// this is more a workaround for hooks looping limitation
// useLogExtent is only working with one log
const LogExtent = ({ log, wellId, updateExtent }) => {
  const [min, max] = useLogExtent(log, wellId);
  useEffect(() => {
    updateExtent(([currentMin, currentMax]) => [Math.min(currentMin, min), Math.max(currentMax, max)]);
  }, [updateExtent, min, max]);
  return null;
};

export default function BiasAndScale({ container, y, gridGutter, refresh, canvas }) {
  const [{ draftMode, selectionById }, dispatch] = useComboContainer();
  const internalStateRef = useRef({ prevSelection: null });
  const segmentData = useSelectedSegmentState();
  const bias = Number(segmentData.scalebias);
  const scale = Number(segmentData.scalefactor);
  const pendingSegments = usePendingSegments();
  const [[xMin, xMax], updateExtent] = useState([0, 0]);
  const currentSelection = Object.keys(selectionById)[0]; // only consider single selection
  if (currentSelection !== internalStateRef.current.prevSelection) {
    updateExtent([0, 0]);
    internalStateRef.current.prevSelection = currentSelection;
  }

  const width = xMax - xMin;
  const { wellId } = useWellIdContainer();

  const { changeSelectedSegmentBias, changeSelectedSegmentScale } = useBiasAndScaleActions(dispatch);

  useEffect(
    function setInitialBias() {
      if (draftMode) {
        changeSelectedSegmentBias(xMax + 10);
      }
    },
    [xMax, changeSelectedSegmentBias, draftMode]
  );

  useEffect(
    function redraw() {
      refresh();
    },
    [refresh, xMin, xMax, bias, scale]
  );

  const segmentContainerRef = useRef(null);
  const startLineRef = useRef(null);
  const endLineRef = useRef(null);

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      changeSelectedSegmentBias(bias + delta);
    },
    [changeSelectedSegmentBias, bias]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale - delta;
      const newScale = newWidth / width;

      changeSelectedSegmentScale(newScale, bias + delta / 2);
    },
    [changeSelectedSegmentScale, width, bias, scale]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse.x - prevMouse.x;

      const newWidth = width * scale + delta;
      const newScale = newWidth / width;

      changeSelectedSegmentScale(newScale, bias + delta / 2);
    },
    [changeSelectedSegmentScale, width, bias, scale]
  );

  const computedWidth = width * scale;
  const computedXMin = xMin - (computedWidth - width) / 2;
  const { saveSelectedWellLog } = useSaveWellLogActions();
  const onDragEnd = useCallback(() => !draftMode && saveSelectedWellLog(), [saveSelectedWellLog, draftMode]);
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
    <React.Fragment>
      {pendingSegments.map(s => (
        <LogExtent log={s} key={s.id} updateExtent={updateExtent} wellId={wellId} />
      ))}
      {/* {draftMode && <DraftLineInit xMax={xMax} />} */}
      <PixiContainer
        container={container}
        x={gridGutter + computedXMin + bias}
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
    </React.Fragment>
  );
}
