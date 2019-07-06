import React, { useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { Card, CardActionArea, CircularProgress } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import classes from "./TimeSliderToolbar.scss";

const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

export function TimeSliderToolbar({
  match: {
    params: { wellId }
  }
}) {
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

TimeSliderToolbar.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export function TimeSliderToolbarWrapper({ children }) {
  return (
    <div>
      <Route path="/:wellId/:page" exact component={TimeSliderToolbar} />
      <div className={classes.viewport}>{children}</div>
    </div>
  );
}

TimeSliderToolbarWrapper.propTypes = {
  children: PropTypes.node
};

export default TimeSliderToolbarWrapper;
