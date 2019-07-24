import React, { useEffect, useCallback } from "react";
import { draftColor, selectionColor } from "../pixiColors";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiContainer from "../../../components/PixiContainer";
import { useSelectedLogExtent, useSelectedSegmentState } from "../selectors";
import PixiLine from "../../../components/PixiLine";
import useDraggable from "../../../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";
import { useBiasAndScaleActions, useSaveWellLogActions } from "../actions";
import { useComboContainer } from "../../ComboDashboard/containers/store";

const lineData = [[0, 10], [0, 0]];
export default function BiasAndScale({ container, y, gridGutter, refresh, canvas }) {
  const [xMin, xMax] = useSelectedLogExtent();
  const width = xMax - xMin;
  const [, dispatch] = useComboContainer();
  const segmentData = useSelectedSegmentState();
  const isDraft = !!segmentData.draftData;
  // if we are in draft mode, we will have some draftData defined
  const { scalebias: bias, scalefactor: scale } = segmentData.draftData || segmentData;

  const { changeSelectedSegmentBias, changeSelectedSegmentScale } = useBiasAndScaleActions(dispatch);

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
  const { saveWellLog } = useSaveWellLogActions();
  console.log("isDraft", isDraft);
  useDraggable({
    container: segmentContainerRef.current && segmentContainerRef.current.container,
    root: container,
    onDrag: onRootDragHandler,
    onDragEnd: !isDraft ? saveWellLog : undefined,
    canvas,
    cursor: "ew-resize",
    width: computedWidth - 4,
    height: 8,
    x: 4,
    y: 0
  });

  useDraggable({
    container: startLineRef.current && startLineRef.current.container,
    root: container,
    onDrag: onStartDragHandler,
    onDragEnd: !isDraft ? saveWellLog : undefined,
    canvas,
    cursor: "col-resize",
    width: 3,
    x: -1,
    y: 0,
    height: 10
  });

  useDraggable({
    container: endLineRef.current && endLineRef.current.container,
    root: container,
    onDrag: onEndDragHandler,
    onDragEnd: !isDraft ? saveWellLog : undefined,
    canvas,
    cursor: "col-resize",
    width: 3,
    x: 0,
    y: 0,
    height: 10
  });

  return (
    <React.Fragment>
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
                  color={isDraft ? draftColor : selectionColor}
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
                  color={isDraft ? draftColor : selectionColor}
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
                  backgroundColor={isDraft ? draftColor : selectionColor}
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
