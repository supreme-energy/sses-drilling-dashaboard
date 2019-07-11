import React, { useCallback, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useComboContainer } from "../../App/Containers";
import PixiLine from "../../../components/PixiLine";
import PixiLabel from "../../../components/PixiLabel";
import { twoDecimals } from "../../../constants/format";
import { useInterpretationRenderer } from ".";
import PixiContainer from "../../../components/PixiContainer";
import useRef from "react-powertools/hooks/useRef";
import useDraggable from "../../../hooks/useDraggable";
import { useCalculateDipFromSurvey } from "../selectors";
import { withRouter } from "react-router";

const SegmentLabel = forwardRef(({ container, segment, y, onDrag, ...props }, ref) => {
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

  useDraggable(labelRef.current && labelRef.current.container, onDrag, labelX, labelY, labelWidth, labelHeight);

  return (
    <PixiLabel
      {...props}
      ref={labelRef}
      y={labelY}
      sizeChanged={onSizeChanged}
      container={container}
      x={labelX}
      textProps={{ fontSize: 12, color: 0xffffff }}
      backgroundProps={{ backgroundColor: 0xe80a23, radius: 5 }}
    />
  );
});

const SegmentSelection = withRouter(({ segment, totalWidth, container, zIndex, segmentHeight }) => {
  const startLineData = useMemo(() => [[0, 0], [totalWidth, 0]], [totalWidth]);
  const endLineData = useMemo(() => [[0, segmentHeight], [totalWidth, segmentHeight]], [totalWidth, segmentHeight]);
  const selectionContainerRef = useRef(null);
  const segmentRef = useRef(null);
  const [, , { onStartSegmentDrag, onEndSegmentDrag }] = useComboContainer();
  const { viewport } = useInterpretationRenderer();

  const onStartSegmentDragHandler = useCallback(
    event => onStartSegmentDrag(event.data.getLocalPosition(viewport), segment),
    [viewport, onStartSegmentDrag, segment]
  );
  const onEndSegmentDragHandler = useCallback(
    event => onEndSegmentDrag(event.data.getLocalPosition(viewport), segment),
    [viewport, onEndSegmentDrag, segment]
  );

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={segment.startdepth}
      container={container}
      updateTransform={frozenScaleTransform}
      child={container => (
        <React.Fragment>
          <SegmentLabel
            container={container}
            zIndex={zIndex}
            segment={segment}
            y={0}
            text={twoDecimals(segment.startdepth)}
            ref={segmentRef}
            onDrag={onStartSegmentDragHandler}
          />
          <SegmentLabel
            container={container}
            zIndex={zIndex}
            segment={segment}
            text={twoDecimals(segment.enddepth)}
            y={segmentHeight}
            onDrag={onEndSegmentDragHandler}
          />
          <PixiLine container={container} data={startLineData} color={0xe80a23} lineWidth={2} nativeLines={false} />
          <PixiLine container={container} data={endLineData} color={0xe80a23} lineWidth={2} nativeLines={false} />
          <PixiRectangle
            zIndex={zIndex}
            width={10}
            height={segmentHeight}
            y={0}
            x={totalWidth - 70}
            radius={5}
            backgroundColor={0xe80a23}
            container={container}
          />
        </React.Fragment>
      )}
    />
  );
});

const Segment = ({ segment, view, selected, container, onSegmentClick, zIndex, totalWidth }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);

  const segmentHeight = view.yScale * (segment.enddepth - segment.startdepth);
  const { refresh } = useInterpretationRenderer();
  useEffect(
    function refreshWebGl() {
      refresh();
    },
    [segment.enddepth, segment.startdepth, refresh]
  );

  return (
    <React.Fragment>
      {selected && (
        <SegmentSelection
          segment={segment}
          totalWidth={totalWidth}
          container={container}
          zIndex={zIndex + 1}
          segmentHeight={segmentHeight}
        />
      )}
      <PixiRectangle
        onClick={onClick}
        zIndex={zIndex}
        width={10}
        updateTransform={frozenScaleTransform}
        height={segmentHeight}
        y={segment.startdepth}
        radius={5}
        backgroundColor={selected ? 0xe80a23 : 0xd2d2d2}
        container={container}
      />
    </React.Fragment>
  );
};

export default function Segments({ segmentsData, container, selectedWellLog, chartWidth }) {
  const { view, refresh } = useInterpretationRenderer();
  const [, , { setSelectedMd }] = useComboContainer();
  const onSegmentClick = useCallback(
    segment => {
      setSelectedMd(segment.startmd);
    },
    [setSelectedMd]
  );
  return (
    <React.Fragment>
      {segmentsData.map(s => {
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
      })}
    </React.Fragment>
  );
}
