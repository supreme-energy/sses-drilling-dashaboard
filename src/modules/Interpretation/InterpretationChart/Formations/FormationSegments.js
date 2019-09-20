import React from "react";
import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { segmentColor, formationTopsSelectedColor } from "../../pixiColors";
import PixiRectangle from "../../../../components/PixiRectangle";
import SegmentLabel from "../../../../components/SegmentLabel";
import { twoDecimals } from "../../../../constants/format";
import PixiLine from "../../../../components/PixiLine";
import PixiContainer from "../../../../components/PixiContainer";
import { useInterpretationRenderer } from "..";
import get from "lodash/get";

export const LabelDepth = ({ y, x, ...props }) => {
  const lineData = [[-5, 0], [5, 0]];
  return (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      y={y}
      x={x}
      container={props.container}
      child={container => (
        <React.Fragment>
          <PixiLine
            container={container}
            data={lineData}
            color={props.backgroundColor}
            lineWidth={2}
            nativeLines={false}
          />
          <SegmentLabel {...props} container={container} offsetX={-5} y={0} />
        </React.Fragment>
      )}
    />
  );
};

const padding = 2;

export default function FormationSegments({
  formationData,
  container,
  view,
  onSegmentClick,
  selectedFormation,
  refresh
}) {
  const { topContainerRef } = useInterpretationRenderer();

  return formationData.map(formationItem => {
    const height = formationItem.height * view.yScale;
    const selected = selectedFormation === formationItem.id;
    const topContainer = get(topContainerRef, "current.container");

    return (
      <React.Fragment key={formationItem.id}>
        <PixiRectangle
          updateTransform={frozenScaleTransform}
          onClick={() => onSegmentClick(formationItem.id)}
          width={10}
          height={height - padding}
          y={formationItem.y}
          x={0}
          radius={5}
          backgroundColor={selected ? formationTopsSelectedColor : segmentColor}
          container={container}
        />
        {selected && topContainer && (
          <LabelDepth
            refresh={refresh}
            container={topContainer}
            backgroundColor={formationTopsSelectedColor}
            y={formationItem.y}
            text={twoDecimals(formationItem.y)}
          />
        )}
      </React.Fragment>
    );
  });
}
