import React, { useCallback, useMemo } from "react";
import useRef from "react-powertools/hooks/useRef";

import { frozenXTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiLine from "../../../../components/PixiLine";
import PixiRectangle from "../../../../components/PixiRectangle";
import PixiContainer from "../../../../components/PixiContainer";
import { useCrossSectionContainer } from "../../../App/Containers";
import { SEGMENT_BUFFER_LEFT, SEGMENT_BUFFER_RIGHT } from "../../../../constants/structuralGuidance";

export const SegmentSelection = ({ totalHeight, container, segments, view, axis }) => {
  const lineData = useMemo(() => [[0, 0], [0, totalHeight]], [totalHeight]);
  const [firstSegment] = segments;
  const lastSegment = segments[1];
  const segmentWidth = view.xScale * (lastSegment[axis] - firstSegment[axis]);
  const selectionContainerRef = useRef(null);

  const startLineRef = useRef(null);
  const endLineRef = useRef(null);

  return (
    <PixiContainer
      ref={selectionContainerRef}
      x={firstSegment[axis] - SEGMENT_BUFFER_LEFT}
      container={container}
      updateTransform={frozenXTransform}
      child={container => (
        <React.Fragment>
          <PixiContainer
            ref={startLineRef}
            container={container}
            updateTransform={frozenXTransform}
            child={container => (
              <PixiLine
                container={container}
                data={lineData}
                color={lastSegment.selectedColor}
                lineWidth={2}
                nativeLines={false}
                alpha={lastSegment.alpha}
              />
            )}
          />
          <PixiContainer
            ref={endLineRef}
            container={container}
            x={segmentWidth - SEGMENT_BUFFER_RIGHT}
            updateTransform={frozenXTransform}
            child={container => (
              <PixiLine
                container={container}
                data={lineData}
                color={lastSegment.selectedColor}
                lineWidth={2}
                nativeLines={false}
                alpha={lastSegment.alpha}
              />
            )}
          />
        </React.Fragment>
      )}
    />
  );
};

const Segment = React.memo(({ segment, selected, container, onSegmentClick, zIndex, view }) => {
  const onClick = useCallback(() => onSegmentClick(segment.id), [onSegmentClick, segment.id]);
  const segmentWidth = view.xScale * (segment.end - segment.start);

  return (
    <React.Fragment>
      <PixiRectangle
        onClick={onClick}
        zIndex={zIndex}
        width={segmentWidth - SEGMENT_BUFFER_RIGHT}
        updateTransform={frozenXTransform}
        height={10}
        x={segment.start - SEGMENT_BUFFER_LEFT}
        y={15}
        radius={5}
        backgroundColor={selected ? segment.selectedColor : segment.color}
        container={container}
        alpha={selected ? segment.selectedAlpha : segment.alpha}
      />
    </React.Fragment>
  );
});

export default function Segments({ segmentsData = [], container, view, axis, selectedSections }) {
  const { toggleSegmentSelection } = useCrossSectionContainer();
  const onSegmentClick = useCallback(id => toggleSegmentSelection(id), [toggleSegmentSelection]);
  const segments = useMemo(
    () =>
      segmentsData.map((s, index) => {
        const nextSegment = segmentsData[index + 1] || {};
        return {
          start: s[axis],
          end: nextSegment[axis],
          color: nextSegment.color,
          id: nextSegment.id,
          alpha: nextSegment.alpha,
          selectedColor: nextSegment.selectedColor,
          selectedAlpha: nextSegment.selectedAlpha,
          md: nextSegment.md
        };
      }),
    [axis, segmentsData]
  );

  return (
    <React.Fragment>
      {segments.map(s => {
        if (!s.id) return;
        const selected = selectedSections[s.id];
        return (
          <Segment
            zIndex={selected ? 2 + segmentsData.length : 2}
            view={view}
            segment={s}
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
