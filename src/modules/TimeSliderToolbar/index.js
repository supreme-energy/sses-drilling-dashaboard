import React, { useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { Card, CardActionArea, CircularProgress } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import classes from "./TimeSliderToolbar.scss";
import { useWellIdContainer } from "../App/Containers";

const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

export function TimeSliderToolbar() {
  const { wellId } = useWellIdContainer();
  const [expanded, toggleExpanded] = useReducer(e => !e, true);

  return (
    <Card className={classes.timeSliderToolbar}>
      <Suspense fallback={<CircularProgress />}>
        <Card className={classes.collapseButtonContainer}>
          <CardActionArea className={classes.collapseButton} onClick={toggleExpanded}>
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
