import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Card, Menu, MenuItem, Typography, ClickAwayListener, withStyles, CardActionArea } from "@material-ui/core";
import { ArrowDropDown, CheckCircle } from "@material-ui/icons";
import classNames from "classnames";

import { COLOR_BY_PHASE_VIEWER } from "../../../../../constants/timeSlider";
import { ON_SURFACE } from "../../../../../constants/wellPathStatus";
import { GRAY } from "../../../../../constants/colors";
import phaseClasses from "./DrillPhaseViewer.scss";

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
  },
  cardContent: {
    lastChild: {
      padding: 0
    }
  }
};

function DrillPhase({ phase }) {
  return (
    <svg width={40} height={40}>
      <title>Icon/Custom/Curve</title>
      <g id="Icon/Custom/Curve" fill="none" fillRule="nonzero">
        <path id="lateral" fill={COLOR_BY_PHASE_VIEWER[phase].lateral} d="M16 39.5h23v-4H16z" />
        <path
          id="curve"
          fill={COLOR_BY_PHASE_VIEWER[phase].curve}
          d="M0 24.5h4c0 6.075 4.925 11 11 11v4c-8.284 0-15-6.716-15-15z"
        />
        <path id="vertical" fill={COLOR_BY_PHASE_VIEWER[phase].top} d="M0 .5v23h4V.5z" />
      </g>
    </svg>
  );
}

function DrillPhaseViewer({ className, classes, expanded, drillPhase, setDrillPhase, setSelectedMenuItem }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const drillPhaseEnum = Object.keys(COLOR_BY_PHASE_VIEWER);
  const currPhase = drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_SURFACE;
  const drillPhaseCode = currPhase.split(" ")[1];

  const handleClickAway = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleDrillPhaseSelect = useCallback(
    phase => {
      setDrillPhase(phase);
      setSelectedMenuItem({ type: "CHANGE_PHASE", payload: phase });
    },
    [setDrillPhase, setSelectedMenuItem]
  );

  return (
    <Card className={classNames(phaseClasses.drillPhaseCard, className)}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className={phaseClasses.clickListenerContent}>
          <CardActionArea
            aria-owns={drillPhase ? "drill-phase-menu" : undefined}
            aria-haspopup="true"
            onClick={e => setAnchorEl(e.currentTarget)}
            className={phaseClasses.drillPhaseButton}
          >
            {expanded && (
              <div className={phaseClasses.drillPhaseViewerExpanded}>
                <Typography className={phaseClasses.drillPhaseButtonText} variant="subtitle1">
                  View
                </Typography>
                <DrillPhase phase={currPhase} />
              </div>
            )}
            <div className={expanded ? phaseClasses.drillPhaseCodeContainerExpanded : phaseClasses.alignItem}>
              <span className={phaseClasses.alignItem}>{drillPhaseCode}</span>
              <ArrowDropDown className={phaseClasses.alignItem} />
            </div>
          </CardActionArea>
          <Menu id="drill-phase-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} disableAutoFocusItem>
            {drillPhaseEnum.map((phase, index) => {
              const phaseCode = phase.split(" ")[1];
              const selected = currPhase === phase;
              return (
                <MenuItem
                  key={index}
                  className={selected ? classes.selectedMenuItem : classes.phaseMenuItem}
                  value={phase}
                  onClick={() => handleDrillPhaseSelect(phase)}
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
    </Card>
  );
}

DrillPhaseViewer.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object,
  expanded: PropTypes.bool,
  drillPhase: PropTypes.string,
  setDrillPhase: PropTypes.func,
  setSelectedMenuItem: PropTypes.func
};

export default withStyles(styles)(DrillPhaseViewer);
