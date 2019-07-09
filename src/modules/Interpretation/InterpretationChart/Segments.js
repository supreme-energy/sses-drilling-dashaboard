import React, { useCallback, useMemo, useEffect, useState } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useSelectedSectionContainer } from "../../App/Containers";
import PixiLine from "../../../components/PixiLine";
import PixiLabel from "../../../components/PixiLabel";
import { twoDecimals } from "../../../constants/format";
import { useInterpretationRenderer } from ".";

const Segment = ({ segment, view, selected, container, onSegmentClick, zIndex, totalWidth, refresh }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);
  const startLineData = useMemo(() => [[0, segment.startdepth], [totalWidth, segment.startdepth]], [
    segment,
    totalWidth
  ]);
  const endLineData = useMemo(() => [[0, segment.enddepth], [totalWidth, segment.enddepth]], [segment, totalWidth]);
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

  return (
    <React.Fragment>
      {selected && (
        <React.Fragment>
          <PixiLabel
            sizeChanged={onSizeChanged}
            container={container}
            text={twoDecimals(segment.enddepth)}
            x={-labelWidth}
            y={view.yScale * segment.enddepth - labelHeight / 2}
            updateTransform={frozenScaleTransform}
            zIndex={zIndex + 1}
            textProps={{ fontSize: 12, color: 0xffffff }}
            backgroundProps={{ backgroundColor: 0xe80a23, radius: 5 }}
          />
          <PixiLine container={container} data={startLineData} color={0xe80a23} />
          <PixiLine container={container} data={endLineData} color={0xe80a23} />
        </React.Fragment>
      )}
      <PixiRectangle
        onClick={onClick}
        zIndex={zIndex}
        width={10}
        updateTransform={frozenScaleTransform}
        height={view.yScale * (segment.enddepth - segment.startdepth)}
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
  const [, , { selectMd }] = useSelectedSectionContainer();
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
