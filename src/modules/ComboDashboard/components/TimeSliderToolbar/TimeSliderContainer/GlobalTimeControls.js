import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography, IconButton } from "@material-ui/core";
import { AccessTime, Restore } from "@material-ui/icons";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

function GlobalTimeControls({ children, expanded, setSliderStep }) {
  const handleSetBeginning = useCallback(() => {
    setSliderStep([0, 1]);
  });

  const handleSetEnd = useCallback(() => {
    setSliderStep([100, 1]);
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
        {expanded && <Typography variant="caption">{"09-18-2019"}</Typography>}
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
        {expanded && <Typography variant="caption">NOW</Typography>}
      </div>
    </div>
  );
}

GlobalTimeControls.propTypes = {
  expanded: PropTypes.bool,
  setSliderStep: PropTypes.func,
  children: PropTypes.node
};
export default GlobalTimeControls;
