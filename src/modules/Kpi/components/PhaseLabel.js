import React, { useMemo } from "react";
import { useTheme } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import * as wellSections from "../../../constants/wellSections";

export default function PhaseLabel({ phase, children, className }) {
  const theme = useTheme();

  const colorByPhase = useMemo(
    () => ({
      [wellSections.SURFACE]: theme.palette.surfaceLabel.main,
      [wellSections.CURVE]: theme.palette.curveLabel.main,
      [wellSections.INTERMEDIATE]: theme.palette.intermadiateLabel.main,
      [wellSections.LATERAL]: theme.palette.lateralLabel.main,
      [wellSections.DRILLOUT]: theme.palette.intermadiateLabel.main
    }),
    [theme]
  );

  return (
    <Typography className={className} style={{ color: colorByPhase[phase] }} variant="body1">
      {children}
    </Typography>
  );
}
