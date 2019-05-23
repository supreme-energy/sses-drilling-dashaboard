import React, { useReducer, useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, IconButton, CircularProgress } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import classes from "./TimeSliderToolbar.scss";
import { ON_SURFACE } from "../../../../constants/wellPathStatus";

const TimeSliderContainer = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSliderContainer"));

function TimeSliderToolbar({ wellId }) {
  const [expanded, toggleExpanded] = useReducer(e => !e, true);
  const [drillPhase, setDrillPhase] = useState(ON_SURFACE);

  return (
    <Card className={classes.timeSliderToolbar}>
      <Card className={classes.collapseButtonContainer}>
        <IconButton className={classes.collapseButton} onClick={toggleExpanded}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Card>
      <div className={classes.expandContainer}>
        <DrillPhaseViewer
          className={classes.noShrink}
          expanded={expanded}
          drillPhase={drillPhase}
          setDrillPhase={setDrillPhase}
        />
        <Suspense fallback={<CircularProgress />}>
          <TimeSliderContainer drillPhase={drillPhase} expanded={expanded} wellId={wellId} />
        </Suspense>
      </div>
    </Card>
  );
}

TimeSliderToolbar.propTypes = {
  wellId: PropTypes.string
};

export default TimeSliderToolbar;
