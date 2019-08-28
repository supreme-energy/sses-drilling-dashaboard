import React, { useMemo } from "react";
import { useSelectedSurvey, useSelectedWellInfoColors } from "../selectors";
import PixiLine from "../../../components/PixiLine";
import PixiContainer from "../../../components/PixiContainer";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { hexColor } from "../../../constants/pixiColors";

export default function TCLLine({ container, width }) {
  const selectedSurvey = useSelectedSurvey();
  const colors = useSelectedWellInfoColors();
  const color = hexColor(colors.colortot);
  const lineData = useMemo(() => [[0, 0], [width, 0]], [width]);
  return selectedSurvey ? (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      y={selectedSurvey.tcl}
      container={container}
      child={container => (
        <PixiLine container={container} data={lineData} color={color} lineWidth={3} nativeLines={false} />
      )}
    />
  ) : null;
}
