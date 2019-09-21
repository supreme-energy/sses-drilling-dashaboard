import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Card, Menu, MenuItem, Typography, ClickAwayListener, CardActionArea } from "@material-ui/core";
import { ArrowDropDown, CheckCircle } from "@material-ui/icons";
import classNames from "classnames";
import _ from "lodash";

import { useDrillPhaseContainer, useWellSections } from "../../App/Containers";
import { COLOR_BY_PHASE_VIEWER, CHOOSE } from "../../../constants/timeSlider";
import { GRAY } from "../../../constants/colors";
import phaseClasses from "./DrillPhaseViewer.scss";

const styles = makeStyles({
  phaseMenuItem: {
    minWidth: 215
  },
  selectedMenuItem: {
    minWidth: 215,
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
});

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

const DrillPhaseViewer = React.memo(({ className, wellId, expanded }) => {
  // Get styles
  const classes = styles();

  // Fetch data
  const drillPhases = useWellSections(wellId);

  // Import shared state
  const { drillPhaseObj, setDrillPhase } = useDrillPhaseContainer();
  const { phase: drillPhase, inView } = drillPhaseObj;

  // Create state for pop-open anchor element
  const [anchorEl, setAnchorEl] = useState(null);

  // Set drill phase when fetching complete
  useEffect(() => {
    if (drillPhases && drillPhases.length) {
      setDrillPhase({ type: "SET", payload: { ...drillPhases[0], set: true } });
    }
  }, [drillPhases, setDrillPhase]);

  // Handle Drill Phase click events
  const handleClickAway = useCallback(() => setAnchorEl(null), []);
  const handleDrillPhaseSelect = phaseObj => setDrillPhase({ type: "SET", payload: { ...phaseObj, set: true } });

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
                <DrillPhase phase={inView ? drillPhase : CHOOSE} />
              </div>
            )}
            <div className={expanded ? phaseClasses.drillPhaseCodeContainerExpanded : phaseClasses.alignItem}>
              <span className={phaseClasses.alignItem}>{inView ? drillPhase : CHOOSE}</span>
              <ArrowDropDown className={phaseClasses.alignItem} />
            </div>
          </CardActionArea>
          <Menu id="drill-phase-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} disableAutoFocusItem>
            {drillPhases.map((phaseObj, index) => {
              const selected = _.isEqual(drillPhaseObj, phaseObj);
              return (
                <MenuItem
                  key={phaseObj.phase + index}
                  className={selected ? classes.selectedMenuItem : classes.phaseMenuItem}
                  value={phaseObj.phase}
                  onClick={() => handleDrillPhaseSelect(phaseObj)}
                >
                  <DrillPhase phase={phaseObj.phase} />
                  <div className={classes.phaseCodeBuffer}>{phaseObj.phase}</div>
                  {selected ? <CheckCircle className={classes.selectedPhase} /> : null}
                </MenuItem>
              );
            })}
          </Menu>
        </div>
      </ClickAwayListener>
    </Card>
  );
});

DrillPhaseViewer.propTypes = {
  className: PropTypes.string,
  wellId: PropTypes.string,
  expanded: PropTypes.bool
};

export default DrillPhaseViewer;
