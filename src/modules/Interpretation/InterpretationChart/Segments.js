import React, { useCallback, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiLine from "../../../components/PixiLine";
import PixiLabel from "../../../components/PixiLabel";
import { twoDecimals } from "../../../constants/format";
import { useInterpretationRenderer } from ".";
import PixiContainer from "../../../components/PixiContainer";
import useRef from "react-powertools/hooks/useRef";
import useDraggable from "../../../hooks/useDraggable";
import { useDragActions, useSaveWellLogActions, useSelectionActions } from "../actions";
import { selectionColor, segmentColor, draftColor } from "../pixiColors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { getIsDraft, useComputedSegments, useComputedDraftSegmentsOnly } from "../selectors";

const SegmentLabel = forwardRef(({ container, segment, y, backgroundColor, ...props }, ref) => {
  const [{ labelWidth, labelHeight }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => {
      updateLabelDimensions({ labelWidth, labelHeight });
    },
    [updateLabelDimensions]
  );

  const labelRef = useRef(null);

  const { refresh } = useInterpretationRenderer();

  useEffect(
    function refreshWebGl() {
      refresh();
    },
    [labelWidth, labelHeight, refresh]
  );

  useImperativeHandle(ref, () => ({
    container: labelRef.current && labelRef.current.container
  }));

  const labelX = -labelWidth;
  const labelY = y - labelHeight / 2;

  return (
    <PixiLabel
      {...props}
      ref={labelRef}
      y={labelY}
      sizeChanged={onSizeChanged}
      container={container}
      x={labelX}
      textProps={{ fontSize: 12, color: 0xffffff }}
      backgroundProps={{ backgroundColor, radius: 5 }}
    />
  );
});

const RightSegments = React.memo(
  ({ allSegments, container, view, totalWidth, nrPrevSurveysToDraft, selectedIndex }) => {
    const { byId } = useComputedSegments();
    return allSegments.map((s, index) => {
      const isDraft = getIsDraft(index, selectedIndex, nrPrevSurveysToDraft);
      const backgroundAlpha = isDraft ? 1 : 0.5;
      const computedSegment = isDraft ? byId[s.id] : s;
      const segmentHeight = view.yScale * (computedSegment.enddepth - computedSegment.startdepth);
      return (
        <PixiRectangle
          width={10}
          key={s.id}
          height={segmentHeight}
          updateTransform={frozenScaleTransform}
          y={computedSegment.startdepth}
          x={totalWidth - 70}
          radius={5}
          backgroundColor={draftColor}
          backgroundAlpha={backgroundAlpha}
          container={container}
        />
      );
    });
  }
);

const SegmentSelection = ({
  totalWidth,
  container,
  selectedWellLog,
  allSegments,
  draftMode,
  nrPrevSurveysToDraft,
  selectedIndex
}) => {
  const { viewport, stage, canvasRef, view } = useInterpretationRenderer();
  const selectedSegment = allSegments[selectedIndex];

  const draftSegments = useComputedDraftSegmentsOnly();

  const segments = useMemo(() => (draftMode ? draftSegments : [selectedSegment]), [
    draftSegments,
    selectedSegment,
    draftMode
  ]);

  const lineData = useMemo(() => [[0, 0], [totalWidth, 0]], [totalWidth]);
  const [firstSegment] = segments;
  const lastSegment = segments[segments.length - 1];
  const segmentHeight = view.yScale * (lastSegment.enddepth - firstSegment.startdepth);
  const selectionContainerRef = useRef(null);
  const segmentRef = useRef(null);
  const { onSegmentDrag, onEndSegmentDrag, onStartSegmentDrag } = useDragActions();
  const { saveSelectedWellLog } = useSaveWellLogActions();

  const onStartSegmentDragHandler = useCallback(
    event => onStartSegmentDrag(event.data.getLocalPosition(viewport), firstSegment),
    [viewport, onStartSegmentDrag, firstSegment]
  );
  const onEndSegmentDragHandler = useCallback(
    event => onEndSegmentDrag(event.data.getLocalPosition(viewport), lastSegment),
    [viewport, onEndSegmentDrag, lastSegment]
  );

  const onSegmentDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = (currMouse.y - prevMouse.y) / view.yScale;
      onSegmentDrag(event.data.getLocalPosition(viewport), delta, firstSegment);
    },
    [viewport, onSegmentDrag, firstSegment, view]
  );

  const startLineRef = useRef(null);
  const endLineRef = useRef(null);
  const segmentDragContainer = useRef(null);
  const onDragEnd = useCallback(() => !draftMode && saveSelectedWellLog(), [saveSelectedWellLog, draftMode]);
  const { refresh } = useInterpretationRenderer();
  const onOver = useCallback(() => {
    refresh();
  }, [refresh]);

  const getStartLine = useCallback(() => startLineRef.current && startLineRef.current.container, []);
  const getEndLine = useCallback(() => endLineRef.current && endLineRef.current.container, []);
  const getSegmentContainer = useCallback(
    () => segmentDragContainer.current && segmentDragContainer.current.container,
    []
  );

  useDraggable({
    getContainer: getStartLine,
    root: stage,
    canvas: canvasRef.current,
    cursor: "row-resize",
    onOver,
    onDrag: onStartSegmentDragHandler,
    onDragEnd,
    x: 0,
    y: -3,
    width: totalWidth,
    height: 6
  });

  useDraggable({
    getContainer: getEndLine,
    root: stage,
    onDrag: onEndSegmentDragHandler,
    canvas: canvasRef.current,
    onOver,
    cursor: "row-resize",
    onDragEnd,
    x: 0,
    y: -2,
    width: totalWidth,
    height: 4
  });

  useDraggable({
    getContainer: getSegmentContainer,
    root: stage,
    onDrag: onSegmentDragHandler,
    canvas: canvasRef.current,
    onOver,
    onDragEnd,
    cursor: "ns-resize",
    x: 0,
    y: 4,
    width: totalWidth,
    height: segmentHeight - 8
  });

  const backgroundColor = draftMode ? draftColor : selectionColor;

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={firstSegment.startdepth}
      container={container}
      updateTransform={frozenScaleTransform}
      child={container => (
        <React.Fragment>
          <SegmentLabel
            container={container}
            backgroundColor={backgroundColor}
            segment={firstSegment}
            y={0}
            text={twoDecimals(firstSegment.startdepth)}
            ref={segmentRef}
          />
          <SegmentLabel
            container={container}
            backgroundColor={backgroundColor}
            segment={lastSegment}
            text={twoDecimals(lastSegment.enddepth)}
            y={segmentHeight}
          />
          <PixiContainer
            x={10}
            ref={segmentDragContainer}
            container={container}
            updateTransform={frozenScaleTransform}
          />
          <PixiContainer
            ref={startLineRef}
            container={container}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                container={container}
                data={lineData}
                color={draftMode ? draftColor : selectionColor}
                lineWidth={2}
                nativeLines={false}
              />
            )}
          />
          <PixiContainer
            ref={endLineRef}
            container={container}
            y={segmentHeight}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                container={container}
                data={lineData}
                color={draftMode ? draftColor : selectionColor}
                lineWidth={2}
                nativeLines={false}
              />
            )}
          />
          {!draftMode && (
            <PixiRectangle
              width={10}
              height={segmentHeight}
              y={0}
              x={totalWidth - 70}
              radius={5}
              backgroundColor={backgroundColor}
              container={container}
            />
          )}
        </React.Fragment>
      )}
    />
  );
};

const Segment = React.memo(({ segment, view, selected, container, onSegmentClick, zIndex, totalWidth }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);
  const segmentHeight = view.yScale * (segment.enddepth - segment.startdepth);

  return (
    <React.Fragment>
      <PixiRectangle
        onClick={onClick}
        zIndex={zIndex}
        width={10}
        updateTransform={frozenScaleTransform}
        height={segmentHeight}
        y={segment.startdepth}
        radius={5}
        backgroundColor={selected ? selectionColor : segmentColor}
        container={container}
      />
    </React.Fragment>
  );
});

export default function Segments({ segmentsData, container, selectedWellLog, chartWidth }) {
  const { view } = useInterpretationRenderer();
  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();
  const { toggleMdSelection } = useSelectionActions();
  const onSegmentClick = useCallback(segment => toggleMdSelection(segment.endmd), [toggleMdSelection]);
  const selectedIndex = useMemo(() => selectedWellLog && segmentsData.findIndex(s => s.id === selectedWellLog.id), [
    segmentsData,
    selectedWellLog
  ]);
  return (
    <React.Fragment>
      {segmentsData.map(s => {
        const selected = selectedWellLog && selectedWellLog.id === s.id;
        return (
          <Segment
            totalWidth={chartWidth}
            segment={s}
            allSegments={segmentsData}
            zIndex={selected ? 2 + segmentsData.length : 2}
            view={view}
            selected={selected}
            container={container}
            onSegmentClick={onSegmentClick}
            key={s.id}
          />
        );
      })}
      {selectedWellLog && (
        <SegmentSelection
          draftMode={draftMode}
          allSegments={segmentsData}
          selectedIndex={selectedIndex}
          totalWidth={chartWidth}
          container={container}
          selectedWellLog={selectedWellLog}
          nrPrevSurveysToDraft={nrPrevSurveysToDraft}
        />
      )}
      {selectedWellLog && draftMode && (
        <RightSegments
          container={container}
          view={view}
          selectedIndex={selectedIndex}
          totalWidth={chartWidth}
          allSegments={segmentsData}
          selectedWellLog={selectedWellLog}
          nrPrevSurveysToDraft={nrPrevSurveysToDraft}
        />
      )}
    </React.Fragment>
  );
}
