import React, { useMemo } from "react";
import { useSelectedWellInfoColors } from "../selectors";
import PixiLine from "../../../components/PixiLine";
import PixiContainer from "../../../components/PixiContainer";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { hexColor } from "../../../constants/pixiColors";

export default function TCLLine({ container, width, tcl, ...props }) {
  const colors = useSelectedWellInfoColors();
  const color = hexColor(colors.colortot);
  const lineData = useMemo(() => [[0, 0], [width, 0]], [width]);

  return tcl !== undefined ? (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      y={tcl}
      container={container}
      child={container => (
        <PixiLine container={container} data={lineData} color={color} lineWidth={3} nativeLines={false} />
      )}
      {...props}
    />
  ) : null;
}
