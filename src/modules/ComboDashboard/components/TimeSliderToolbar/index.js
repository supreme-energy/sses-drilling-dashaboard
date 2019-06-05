import React, { useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, CardActionArea, CircularProgress } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import { useTimeSliderContainer } from "../../../App/Containers";
import DrillPhaseViewer from "./DrillPhaseViewer";
import { COLOR_BY_PHASE_VIEWER } from "../../../../constants/timeSlider";
import { ON_SURFACE } from "../../../../constants/wellPathStatus";
import classes from "./TimeSliderToolbar.scss";

const TimeSliderContainer = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSliderContainer"));

function graphReducer(state, action) {
  switch (action.type) {
    case "CHANGE":
      return COLOR_BY_PHASE_VIEWER[action.payload].graphs;
    case "ADD":
      return [...state, action.payload];
    case "REMOVE":
      return state.filter(item => item !== action.payload);
    default:
      return state;
  }
}

function TimeSliderToolbar({ wellId }) {
  const { drillPhase, setDrillPhase } = useTimeSliderContainer();
  const [expanded, toggleExpanded] = useReducer(e => !e, true);
  const [selectedMenuItems, setSelectedMenuItem] = useReducer(graphReducer, COLOR_BY_PHASE_VIEWER[ON_SURFACE].graphs);

  return (
    <Card className={classes.timeSliderToolbar}>
      <Card className={classes.collapseButtonContainer}>
        <CardActionArea className={classes.collapseButton} onClick={toggleExpanded}>
          {expanded ? <ExpandLess className={classes.expandLessIcon} /> : <ExpandMore />}
        </CardActionArea>
      </Card>
      <DrillPhaseViewer
        className={classes.noShrink}
        expanded={expanded}
        drillPhase={drillPhase}
        setDrillPhase={setDrillPhase}
        setSelectedMenuItem={setSelectedMenuItem}
      />
      <Suspense fallback={<CircularProgress />}>
        <TimeSliderContainer
          selectedMenuItems={selectedMenuItems}
          setSelectedMenuItem={setSelectedMenuItem}
          expanded={expanded}
          wellId={wellId}
        />
      </Suspense>
    </Card>
  );
}

TimeSliderToolbar.propTypes = {
  wellId: PropTypes.string
};

export default TimeSliderToolbar;
