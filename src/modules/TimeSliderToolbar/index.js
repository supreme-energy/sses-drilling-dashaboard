import React, { useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { Card, CardActionArea, CircularProgress } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import classes from "./TimeSliderToolbar.scss";
import { useWellIdContainer } from "../App/Containers";
import { useLocalStorage } from "../App/localstorers";
const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

export function TimeSliderToolbar() {
  const { wellId } = useWellIdContainer();
  let stateAccessor = wellId + "_time_slider_collapse_state";
  const [expanded, toggleExpanded] = useLocalStorage(stateAccessor, 'true');

  return (
    <Card className={classes.timeSliderToolbar}>
      <Suspense fallback={<CircularProgress />}>
        <Card className={classes.collapseButtonContainer}>
          <CardActionArea className={classes.collapseButton}
            state-accessor={stateAccessor}
            onClick={() =>{
        		  let stateAccessor = event.target.parentElement.getAttribute('state-accessor')
        		  console.log(stateAccessor)
        		  let cstate = (localStorage.getItem(stateAccessor) == "true" || localStorage.getItem(stateAccessor) == null)
        		  toggleExpanded(!cstate)
        		  }
          	}>
            {expanded ? <ExpandLess className={classes.expandLessIcon} /> : <ExpandMore />}
          </CardActionArea>
        </Card>
        <DrillPhaseViewer className={classes.noShrink} wellId={wellId} expanded={expanded} />
        <TimeSlider expanded={expanded} wellId={wellId} />
      </Suspense>
    </Card>
  );
}

TimeSliderToolbar.propTypes = {};

export function TimeSliderToolbarWrapper({ children }) {
  return (
    <React.Fragment>
      <Route path="/:wellId/:page/:subpage?" exact component={TimeSliderToolbar} />
      <div className={classes.viewport}>{children}</div>
    </React.Fragment>
  );
}

TimeSliderToolbarWrapper.propTypes = {
  children: PropTypes.node
};

export default TimeSliderToolbarWrapper;
