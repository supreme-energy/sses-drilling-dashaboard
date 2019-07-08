import React, { useCallback, useMemo, useEffect, useState } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import PixiLine from "../../../components/PixiLine";
import PixiLabel from "../../../components/PixiLabel";
import { twoDecimals } from "../../../constants/format";
import { useInterpretationRenderer } from ".";
import PixiContainer from "../../../components/PixiContainer";
import useRef from "react-powertools/hooks/useRef";
import useDraggable from "../../../hooks/useDraggable";

function SegmentSelection({ segment, totalWidth, container, refresh, zIndex, segmentHeight }) {
  const lineData = useMemo(() => [[0, 0], [totalWidth, 0]], [totalWidth]);
  const [{ labelWidth, labelHeight }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => {
      updateLabelDimensions({ labelWidth, labelHeight });
    },
    [updateLabelDimensions]
  );

  useEffect(
    function refreshWebGl() {
      refresh();
    },
    [labelWidth, labelHeight, refresh]
  );

  const selectionContainerRef = useRef(null);
  const startLineRef = useRef(null);
  const endLineRef = useRef(null);

  const onDrag = useCallback(mousePosition => {
    console.log("on drag", mousePosition);
  }, []);

  const onEndLineDrag = useCallback(mousePosition => {
    console.log("end line drag", mousePosition);
  }, []);

  // useDraggable(
  //   selectionContainerRef.current && selectionContainerRef.current.container,
  //   onDrag,
  //   totalWidth,
  //   segmentHeight
  // );

  useDraggable(endLineRef.current && endLineRef.current.container, onEndLineDrag, totalWidth, 5);

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={segment.startdepth}
      container={container}
      updateTransform={frozenScaleTransform}
      child={container => (
        <React.Fragment>
          <PixiLabel
            sizeChanged={onSizeChanged}
            container={container}
            text={twoDecimals(segment.enddepth)}
            x={-labelWidth}
            y={segmentHeight - labelHeight / 2}
            zIndex={zIndex}
            textProps={{ fontSize: 12, color: 0xffffff }}
            backgroundProps={{ backgroundColor: 0xe80a23, radius: 5 }}
          />
          <PixiContainer
            ref={startLineRef}
            container={container}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine container={container} data={lineData} color={0xe80a23} lineWidth={2} nativeLines={false} />
            )}
          />
          <PixiContainer
            ref={endLineRef}
            container={container}
            y={segmentHeight}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine container={container} data={lineData} color={0xe80a23} lineWidth={2} nativeLines={false} />
            )}
          />
        </React.Fragment>
      )}
    />
  );
}

const Segment = ({ segment, view, selected, container, onSegmentClick, zIndex, totalWidth, refresh }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);

  const segmentHeight = view.yScale * (segment.enddepth - segment.startdepth);

  return (
    <React.Fragment>
      {selected && (
        <SegmentSelection
          segment={segment}
          totalWidth={totalWidth}
          container={container}
          refresh={refresh}
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
  const [, , { selectMd }] = useComboContainer();
  const onSegmentClick = useCallback(
    segment => {
      selectMd(segment.startmd);
    },
    [selectMd]
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
            refresh={refresh}
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
