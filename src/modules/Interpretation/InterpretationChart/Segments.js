import React, { useCallback, useMemo } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useInterpretationRenderer, gridGutter } from ".";
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
      const computedSegment = isDraft ? byId[s.id] : s;
      const segmentHeight = view.yScale * (computedSegment.enddepth - computedSegment.startdepth);
      return (
        <PixiRectangle
          width={10}
          key={s.id}
          height={segmentHeight}
          updateTransform={frozenScaleTransform}
          y={computedSegment.startdepth}
          x={(totalWidth - 10 - gridGutter) / view.xScale}
          radius={5}
          backgroundColor={draftColor}
          backgroundAlpha={0.5}
          container={container}
        />
      );
    });
  }
);

const Segment = React.memo(({ segment, view, selected, container, onSegmentClick, ...rest }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);
  const segmentHeight = view.yScale * Math.abs(segment.enddepth - segment.startdepth);

  return (
    <React.Fragment>
      <PixiRectangle
        onClick={onClick}
        width={10}
        updateTransform={frozenScaleTransform}
        height={segmentHeight}
        y={Math.min(segment.startdepth, segment.enddepth)}
        radius={5}
        backgroundColor={selected ? selectionColor : segmentColor}
        container={container}
        backgroundAlpha={0.5}
        {...rest}
      />
    </React.Fragment>
  );
});

export default React.memo(({ segmentsData, container, selectedWellLog, chartWidth }) => {
  const {
    view,
    size: { height }
  } = useInterpretationRenderer();
  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();
  const { changeWellLogSelection } = useSelectionActions();
  const onSegmentClick = useCallback(segment => changeWellLogSelection(segment), [changeWellLogSelection]);

  const selectedIndex = useMemo(() => selectedWellLog && segmentsData.findIndex(s => s.id === selectedWellLog.id), [
    segmentsData,
    selectedWellLog
  ]);

  const colors = useSelectedWellInfoColors();
  const draftColor = hexColor(colors.draftcolor);
  const yMin = Math.floor((-1 * view.y) / view.yScale);
  const yMax = yMin + Math.floor((height + view.yScale) / view.yScale);

  return (
    <React.Fragment>
      {selectedWellLog && (
        <SegmentSelection
          zIndex={segmentsData.length + 3}
          draftMode={draftMode}
          allSegments={segmentsData}
          draftColor={draftColor}
          selectedIndex={selectedIndex}
          onSegmentClick={onSegmentClick}
          totalWidth={chartWidth}
          container={container}
          selectedWellLog={selectedWellLog}
          nrPrevSurveysToDraft={nrPrevSurveysToDraft}
        />
      )}

      {segmentsData.map((s, index) => {
        const selected = selectedWellLog && selectedWellLog.id === s.id;
        const logMin = Math.min(s.startdepth, s.enddepth);
        const logMax = Math.max(s.startdepth, s.enddepth);

        if (!selected && (logMin > yMax || logMax < yMin)) {
          return null;
        }

        return (
          <Segment
            totalWidth={chartWidth}
            segment={s}
            allSegments={segmentsData}
            zIndex={selected ? 2 + index : 2}
            view={view}
            selected={selected}
            container={container}
            onSegmentClick={onSegmentClick}
            key={s.id}
          />
        );
      })}

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
