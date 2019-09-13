import React from "react";
import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { segmentColor, formationTopsSelectedColor } from "../../pixiColors";
import PixiRectangle from "../../../../components/PixiRectangle";
import SegmentLabel from "../../../../components/SegmentLabel";
import { twoDecimals } from "../../../../constants/format";
import PixiLine from "../../../../components/PixiLine";
import PixiContainer from "../../../../components/PixiContainer";

const LabelDepthDepth = ({ gridGutter, y, ...props }) => {
  const lineData = [[-5, 0], [5, 0]];
  return (
    <React.Fragment>
      <PixiContainer
        updateTransform={frozenScaleTransform}
        y={y}
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
    </React.Fragment>
  );
};

export default function FormationSegments({
  formationData,
  container,
  view,
  onSegmentClick,
  selectedFormation,
  refresh,
  gridGutter
}) {
  return formationData.map(formationItem => {
    const padding = 2;
    const height = formationItem.height * view.yScale;
    const selected = selectedFormation === formationItem.id;

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
        {selected && (
          <LabelDepthDepth
            gridGutter={gridGutter}
            refresh={refresh}
            container={container}
            backgroundColor={formationTopsSelectedColor}
            y={formationItem.y}
            text={twoDecimals(formationItem.y)}
          />
        )}
      </React.Fragment>
    );
  });
}
