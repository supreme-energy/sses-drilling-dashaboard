import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography, IconButton } from "@material-ui/core";
import { AccessTime, Restore } from "@material-ui/icons";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

function GlobalTimeControls({ children, expanded, setSliderStep, dates, maxSliderStep }) {
  const handleSetBeginning = useCallback(() => {
    setSliderStep([0, 1]);
  });

  const handleSetEnd = useCallback(() => {
    setSliderStep([maxSliderStep, 1]);
  });
  return (
    <div className={classes.timeSliderView}>
      <div
        className={classNames(
          classes.backwardTime,
          expanded ? classes.expandedBackwardTime : classes.collapsedBackwardTime
        )}
      >
        <IconButton onClick={handleSetBeginning}>
          <Restore />
        </IconButton>
        {expanded && <Typography variant="caption">{dates[0]}</Typography>}
      </div>
      {children}
      <div
        className={classNames(
          classes.forwardTime,
          expanded ? classes.expandedForwardTime : classes.collapsedForwardTime
        )}
      >
        <IconButton onClick={handleSetEnd}>
          <AccessTime />
        </IconButton>
        {expanded && <Typography variant="caption">{dates[1]}</Typography>}
      </div>
    </div>
  );
}

GlobalTimeControls.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  children: PropTypes.node,
  dates: PropTypes.arrayOf(PropTypes.string),
  maxSliderStep: PropTypes.number
};
export default GlobalTimeControls;
