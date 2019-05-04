import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Menu,
  MenuItem,
  Button,
  Typography,
  ClickAwayListener,
  withStyles
} from "@material-ui/core";
import { ArrowDropDown, CheckCircle } from "@material-ui/icons";
import classNames from "classnames";

import { ON_CURVE, ON_LATERAL, ON_DRILLOUT, ON_INTERMEDIATE, ON_SURFACE } from "../../../../constants/wellPathStatus";
import phaseClasses from "./DrillPhaseViewer.scss";

const gray = "#757575";
const green = "#09C501";

const colorsForPhaseViewer = {
  [ON_SURFACE]: {
    top: green,
    curve: gray,
    lateral: gray
  },
  [ON_INTERMEDIATE]: {
    top: green,
    curve: gray,
    lateral: gray
  },
  [ON_DRILLOUT]: {
    top: green,
    curve: gray,
    lateral: gray
  },
  [ON_CURVE]: {
    top: gray,
    curve: green,
    lateral: gray
  },
  [ON_LATERAL]: {
    top: gray,
    curve: gray,
    lateral: green
  }
};

const styles = {
  phaseMenuItem: {
    minWidth: 185,
    backgroundColor: "rgba(0, 0, 0, 0.15)"
  },
  phaseCodeBuffer: {
    marginLeft: 10
  },
  selectedPhase: {
    position: "absolute",
    right: 12,
    color: gray
  }
};

function DrillPhase({ phase }) {
  return (
    <svg width={40} height={40}>
      <title>Icon/Custom/Curve</title>
      <g id="Icon/Custom/Curve" fill="none" fillRule="nonzero">
        <path id="lateral" fill={colorsForPhaseViewer[phase].lateral} d="M16 39.5h23v-4H16z" />
        <path
          id="curve"
          fill={colorsForPhaseViewer[phase].curve}
          d="M0 24.5h4c0 6.075 4.925 11 11 11v4c-8.284 0-15-6.716-15-15z"
        />
        <path id="vertical" fill={colorsForPhaseViewer[phase].top} d="M0 .5v23h4V.5z" />
      </g>
    </svg>
  );
}

function DrillPhaseViewer({ className, classes }) {
  const [drillPhase, setDrillPhase] = useState(ON_SURFACE);
  const [anchorEl, setAnchorEl] = useState(null);
  const drillPhaseEnum = Object.keys(colorsForPhaseViewer);
  const currPhase = drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_SURFACE;
  const drillPhaseCode = currPhase.split(" ")[1];

  console.log(drillPhase, "render");
  return (
    <Card className={classNames(phaseClasses.card, className)}>
      <CardContent className={phaseClasses.cardContent}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <div>
            <Button
              aria-owns={drillPhase ? "drill-phase-menu" : undefined}
              aria-haspopup="true"
              onClick={e => setAnchorEl(e.currentTarget)}
              className={phaseClasses.drillPhaseButton}
            >
              <Typography className={phaseClasses.drillPhaseButtonText} variant="subtitle1" gutterBottom>
                View
              </Typography>
              <DrillPhase phase={currPhase} />
              <div className={phaseClasses.drillPhaseCodeContainer}>
                <span className={phaseClasses.drillPhaseCode}>{drillPhaseCode}</span>
                <ArrowDropDown />
              </div>
            </Button>
            <Menu id="drill-phase-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} disableAutoFocusItem>
              {drillPhaseEnum.map((phase, index) => {
                const phaseCode = phase.split(" ")[1];
                if (currPhase === phase) {
                  return (
                    <MenuItem key={index} onClick={() => setDrillPhase(phase)} className={classes.phaseMenuItem}>
                      <DrillPhase phase={phase} />
                      <div className={classes.phaseCodeBuffer}>{phaseCode}</div>
                      <CheckCircle className={classes.selectedPhase} />
                    </MenuItem>
                  );
                } else {
                  return (
                    <MenuItem key={index} onClick={() => setDrillPhase(phase)}>
                      <DrillPhase phase={phase} />
                      <div className={classes.phaseCodeBuffer}>{phaseCode}</div>
                    </MenuItem>
                  );
                }
              })}
            </Menu>
          </div>
        </ClickAwayListener>
      </CardContent>
    </Card>
  );
}

export default withStyles(styles)(DrillPhaseViewer);
