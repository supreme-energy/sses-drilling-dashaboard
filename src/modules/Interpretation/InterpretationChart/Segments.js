import React, { useCallback } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useComboContainer } from "../../ComboDashboard/containers/store";

const Segment = ({ segment, view, selected, container, onSegmentClick, zIndex }) => {
  const onClick = useCallback(() => onSegmentClick(segment), [onSegmentClick, segment]);
  return (
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
  );
};
export default function Segments({ segmentsData, container, view, selectedWellLog }) {
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
