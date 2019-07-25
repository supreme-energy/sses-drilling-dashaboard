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
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { useDragActions, useSaveWellLogActions } from "../actions";
import { selectionColor, segmentColor, draftColor } from "../pixiColors";

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

const SegmentSelection = ({ segment, totalWidth, container, zIndex, segmentHeight, isDraft }) => {
  const lineData = useMemo(() => [[0, 0], [totalWidth, 0]], [totalWidth]);

  const selectionContainerRef = useRef(null);
  const segmentRef = useRef(null);
  const { onStartSegmentDrag, onEndSegmentDrag, onSegmentDrag } = useDragActions();
  const { saveWellLog } = useSaveWellLogActions();
  const { viewport, stage, canvasRef, view } = useInterpretationRenderer();

  const onStartSegmentDragHandler = useCallback(
    event => onStartSegmentDrag(event.data.getLocalPosition(viewport), segment),
    [viewport, onStartSegmentDrag, segment]
  );
  const onEndSegmentDragHandler = useCallback(
    event => onEndSegmentDrag(event.data.getLocalPosition(viewport), segment),
    [viewport, onEndSegmentDrag, segment]
  );

  const onSegmentDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = (currMouse.y - prevMouse.y) / view.yScale;
      onSegmentDrag(event.data.getLocalPosition(viewport), delta, segment);
    },
    [viewport, onSegmentDrag, segment, view]
  );

  const startLineRef = useRef(null);
  const endLineRef = useRef(null);
  const segmentDragContainer = useRef(null);
  const onDragEnd = !isDraft ? saveWellLog : undefined;

  useDraggable({
    container: startLineRef.current && startLineRef.current.container,
    root: stage,
    canvas: canvasRef.current,
    cursor: "row-resize",
    onDrag: onStartSegmentDragHandler,
    onDragEnd,
    x: 0,
    y: -3,
    width: totalWidth,
    height: 6
  });

  useDraggable({
    container: endLineRef.current && endLineRef.current.container,
    root: stage,
    onDrag: onEndSegmentDragHandler,
    canvas: canvasRef.current,
    cursor: "row-resize",
    onDragEnd,
    x: 0,
    y: -2,
    width: totalWidth,
    height: 4
  });

  useDraggable({
    container: segmentDragContainer.current && segmentDragContainer.current.container,
    root: stage,
    onDrag: onSegmentDragHandler,
    canvas: canvasRef.current,
    onDragEnd,
    cursor: "ns-resize",
    x: 0,
    y: 4,
    width: totalWidth,
    height: segmentHeight - 8
  });

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={segment.startdepth}
      container={container}
      zIndex={zIndex}
      updateTransform={frozenScaleTransform}
      child={container => (
        <React.Fragment>
          <SegmentLabel
            container={container}
            backgroundColor={isDraft ? draftColor : selectionColor}
            segment={segment}
            y={0}
            text={twoDecimals(segment.startdepth)}
            ref={segmentRef}
          />
          <SegmentLabel
            container={container}
            backgroundColor={isDraft ? draftColor : selectionColor}
            segment={segment}
            text={twoDecimals(segment.enddepth)}
            y={segmentHeight}
          />
          <PixiContainer ref={segmentDragContainer} container={container} updateTransform={frozenScaleTransform} />
          <PixiContainer
            ref={startLineRef}
            container={container}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                container={container}
                data={lineData}
                color={isDraft ? draftColor : selectionColor}
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
                color={isDraft ? draftColor : selectionColor}
                lineWidth={2}
                nativeLines={false}
              />
            )}
          />
          <PixiRectangle
            width={10}
            height={segmentHeight}
            y={0}
            x={totalWidth - 70}
            radius={5}
            backgroundColor={isDraft ? draftColor : selectionColor}
            container={container}
          />
        </React.Fragment>
      )}
    />
  );
};

const Segment = ({ segment, view, selected, container, onSegmentClick, zIndex, totalWidth }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);
  const segmentData = (segment && segment.draftData) || segment;
  const isDraft = segment && segment.draftData;
  const segmentSelectionHeight = view.yScale * (segmentData.enddepth - segmentData.startdepth);
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
      {selected && (
        <SegmentSelection
          segment={segmentData}
          totalWidth={totalWidth}
          container={container}
          isDraft={isDraft}
          zIndex={zIndex + 1}
          segmentHeight={segmentSelectionHeight}
        />
      )}
    </React.Fragment>
  );
};

export default function Segments({ segmentsData, container, selectedWellLog, chartWidth }) {
  const { view } = useInterpretationRenderer();
  const [, , { setSelectedMd }] = useComboContainer();
  const onSegmentClick = useCallback(
    segment => {
      setSelectedMd(segment.startmd);
    },
    [setSelectedMd]
  );

  return segmentsData.map(s => {
    const selected = selectedWellLog && selectedWellLog.id === s.id;
    return (
      <Segment
        totalWidth={chartWidth}
        segment={s}
        zIndex={selected ? 2 + segmentsData.length : 2}
        view={view}
        selected={selected}
        container={container}
        onSegmentClick={onSegmentClick}
        key={s.id}
      />
    );
  });
}
