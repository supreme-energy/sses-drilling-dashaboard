import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography, IconButton } from "@material-ui/core";
import { AccessTime, Restore } from "@material-ui/icons";
import classNames from "classnames";

import { transformDate } from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

export const GlobalStartTimeControl = React.memo(({ expanded, setSliderStep, date }) => {
  const handleSetBeginning = useCallback(() => {
    setSliderStep([0, 1]);
  }, [setSliderStep]);

  return (
    <div
      className={classNames(
        classes.backwardTime,
        expanded ? classes.expandedBackwardTime : classes.collapsedBackwardTime
      )}
    >
      <IconButton onClick={handleSetBeginning}>
        <Restore />
      </IconButton>
      {expanded && <Typography variant="caption">{transformDate(date)}</Typography>}
    </div>
  );
});

GlobalStartTimeControl.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  date: PropTypes.string
};

export const GlobalEndTimeControl = React.memo(({ expanded, setSliderStep, date, maxSliderStep }) => {
  const handleSetEnd = useCallback(() => {
    setSliderStep([maxSliderStep, 1]);
  }, [setSliderStep, maxSliderStep]);

  return (
    <div
      className={classNames(classes.forwardTime, expanded ? classes.expandedForwardTime : classes.collapsedForwardTime)}
    >
      <IconButton onClick={handleSetEnd}>
        <AccessTime />
      </IconButton>
      {expanded && <Typography variant="caption">{transformDate(date)}</Typography>}
    </div>
  );
});

GlobalEndTimeControl.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  date: PropTypes.string,
  maxSliderStep: PropTypes.number
};
