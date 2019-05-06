import React, { useState } from "react";
import PropTypes from "prop-types";
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

import {
  ON_CURVE,
  ON_LATERAL,
  ON_DRILLOUT,
  ON_INTERMEDIATE,
  ON_SURFACE
} from "../../../../../constants/wellPathStatus";
import { GREEN, GRAY } from "../../../../../constants/colors";
import phaseClasses from "./DrillPhaseViewer.scss";

const colorsForPhaseViewer = {
  [ON_SURFACE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY
  },
  [ON_INTERMEDIATE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY
  },
  [ON_DRILLOUT]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY
  },
  [ON_CURVE]: {
    top: GRAY,
    curve: GREEN,
    lateral: GRAY
  },
  [ON_LATERAL]: {
    top: GRAY,
    curve: GRAY,
    lateral: GREEN
  }
};

const styles = {
  phaseMenuItem: {
    minWidth: 185
  },
  selectedMenuItem: {
    minWidth: 185,
    backgroundColor: "rgba(0, 0, 0, 0.15)"
  },
  phaseCodeBuffer: {
    marginLeft: 10
  },
  selectedPhase: {
    position: "absolute",
    right: 12,
    color: GRAY
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

function DrillPhaseViewer({ className, classes, expanded }) {
  const [drillPhase, setDrillPhase] = useState(ON_SURFACE);
  const [anchorEl, setAnchorEl] = useState(null);
  const drillPhaseEnum = Object.keys(colorsForPhaseViewer);
  const currPhase = drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_SURFACE;
  const drillPhaseCode = currPhase.split(" ")[1];

  return (
    <Card
      className={
        expanded
          ? classNames(phaseClasses.drillPhaseCard, phaseClasses.expanded, className)
          : classNames(phaseClasses.drillPhaseCard, className)
      }
    >
      <CardContent className={phaseClasses.cardContent}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <div>
            <Button
              aria-owns={drillPhase ? "drill-phase-menu" : undefined}
              aria-haspopup="true"
              onClick={e => setAnchorEl(e.currentTarget)}
              className={phaseClasses.drillPhaseButton}
            >
              {expanded && (
                <div>
                  <Typography className={phaseClasses.drillPhaseButtonText} variant="subtitle1" gutterBottom>
                    View
                  </Typography>
                  <DrillPhase phase={currPhase} />
                </div>
              )}
              <div
                className={
                  expanded
                    ? phaseClasses.drillPhaseCodeContainerExpanded
                    : phaseClasses.drillPhaseCodeContainerCollapsed
                }
              >
                <span className={expanded ? phaseClasses.drillPhaseCode : ""}>{drillPhaseCode}</span>
                <ArrowDropDown className={expanded ? phaseClasses.dropDown : phaseClasses.collapsedDropDown} />
              </div>
            </Button>
            <Menu id="drill-phase-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} disableAutoFocusItem>
              {drillPhaseEnum.map((phase, index) => {
                const phaseCode = phase.split(" ")[1];
                const selected = currPhase === phase;
                return (
                  <MenuItem
                    key={index}
                    className={selected ? classes.selectedMenuItem : classes.phaseMenuItem}
                    onClick={() => setDrillPhase(phase)}
                  >
                    <DrillPhase phase={phase} />
                    <div className={classes.phaseCodeBuffer}>{phaseCode}</div>
                    {selected ? <CheckCircle className={classes.selectedPhase} /> : null}
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
        </ClickAwayListener>
      </CardContent>
    </Card>
  );
}

DrillPhaseViewer.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object,
  expanded: PropTypes.bool
};

export default withStyles(styles)(DrillPhaseViewer);
