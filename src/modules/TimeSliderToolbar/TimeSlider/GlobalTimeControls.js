import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography, Button } from "@material-ui/core";
import { AccessTime, Restore } from "@material-ui/icons";
import classNames from "classnames";

import { transformDate } from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

export const GlobalStartTimeControl = React.memo(({ expanded, setSliderStep, date }) => {
  const handleSetBeginning = useCallback(() => setSliderStep({ type: "RESET" }), [setSliderStep]);

  return (
    <div
      className={classNames(classes.globalTime, expanded ? classes.expandedGlobalTime : classes.collapsedGlobalTime)}
    >
      <Button onClick={handleSetBeginning}>
        <Restore />
        {expanded && <Typography variant="caption">{transformDate(date)}</Typography>}
      </Button>
    </div>
  );
});

GlobalStartTimeControl.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  date: PropTypes.string
};

export const GlobalEndTimeControl = React.memo(({ expanded, setSliderStep, date }) => {
  const handleSetEnd = useCallback(() => setSliderStep({ type: "SET_TO_MAX" }), [setSliderStep]);

  return (
    <div
      className={classNames(classes.globalTime, expanded ? classes.expandedGlobalTime : classes.collapsedGlobalTime)}
    >
      <Button onClick={handleSetEnd}>
        <AccessTime />
        {expanded && <Typography variant="caption">{transformDate(date)}</Typography>}
      </Button>
    </div>
  );
});

GlobalEndTimeControl.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  date: PropTypes.string,
  maxSliderStep: PropTypes.number
};
