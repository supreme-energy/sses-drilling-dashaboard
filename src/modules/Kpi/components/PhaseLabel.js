import React from "react";
import { makeStyles, useTheme } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import * as wellSections from "../../../constants/wellSections";
import classNames from "classnames";

const useStyles = makeStyles({
  [wellSections.SURFACE]: theme => {
    return {
      color: theme.palette.surfaceLabel.main
    };
  },
  [wellSections.CURVE]: theme => {
    return {
      color: theme.palette.curveLabel.main
    };
  },
  [wellSections.INTERMEDIATE]: theme => {
    return {
      color: theme.palette.intermadiateLabel.main
    };
  },
  [wellSections.LATERAL]: theme => {
    return {
      color: theme.palette.lateralLabel.main
    };
  }
});

export default function PhaseLabel({ phase, children, className }) {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <Typography className={classNames(classes[phase], className)} variant="body1">
      {children}
    </Typography>
  );
}
