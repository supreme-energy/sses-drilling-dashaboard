import React, { useMemo } from "react";
import { useSelectedSurvey } from "../selectors";
import PixiLine from "../../../components/PixiLine";
import PixiContainer from "../../../components/PixiContainer";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";

export default function TCLLine({ container, width }) {
  const selectedSurvey = useSelectedSurvey();

  const lineData = useMemo(() => [[0, 0], [width, 0]], [width]);
  return selectedSurvey ? (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      y={selectedSurvey.tcl}
      container={container}
      child={container => (
        <PixiLine container={container} data={lineData} color={0x000000} lineWidth={3} nativeLines={false} />
      )}
    />
  ) : null;
}
