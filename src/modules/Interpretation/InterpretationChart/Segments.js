import React, { useCallback, useMemo } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useInterpretationRenderer } from ".";
import { useSelectionActions } from "../actions";
import { selectionColor, segmentColor } from "../pixiColors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { getIsDraft, useComputedSegments, useSelectedWellInfoColors } from "../selectors";
import { hexColor } from "../../../constants/pixiColors";
import SegmentSelection from "./SegmentSelection";

const RightSegments = React.memo(
  ({ allSegments, container, view, totalWidth, nrPrevSurveysToDraft, selectedIndex, draftColor }) => {
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

export default React.memo(({ segmentsData, container, selectedWellLog, chartWidth }) => {
  const { view } = useInterpretationRenderer();
  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();
  const { toggleMdSelection } = useSelectionActions();
  const onSegmentClick = useCallback(segment => toggleMdSelection(segment.endmd), [toggleMdSelection]);
  const selectedIndex = useMemo(() => selectedWellLog && segmentsData.findIndex(s => s.id === selectedWellLog.id), [
    segmentsData,
    selectedWellLog
  ]);

  const colors = useSelectedWellInfoColors();
  const draftColor = hexColor(colors.draftcolor);

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
          draftColor={draftColor}
          selectedIndex={selectedIndex}
          totalWidth={chartWidth}
          container={container}
          selectedWellLog={selectedWellLog}
          nrPrevSurveysToDraft={nrPrevSurveysToDraft}
        />
      )}
      {selectedWellLog && draftMode && (
        <RightSegments
          draftColor={draftColor}
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
});
