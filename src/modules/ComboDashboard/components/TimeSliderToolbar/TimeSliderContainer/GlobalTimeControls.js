import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography, IconButton } from "@material-ui/core";
import { AccessTime, Restore } from "@material-ui/icons";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

function GlobalTimeControls({ children, expanded, setSliderStep }) {
  const handleSetBeginning = useCallback(() => {
    setSliderStep(0);
  });

  const handleSetEnd = useCallback(() => {
    setSliderStep(100);
  });
  return (
    <div className={classes.timeSliderView}>
      <div>
        <IconButton onClick={handleSetBeginning}>
          <Restore
            className={classNames(
              classes.backwardTime,
              expanded ? classes.expandedBackwardTime : classes.collapsedBackwardTime
            )}
          />
          {expanded && (
            <Typography className={classes.beginningTime} variant="caption">
              {"09-18-2019"}
            </Typography>
          )}
        </IconButton>
      </div>
      {children}
      <div>
        <IconButton onClick={handleSetEnd}>
          <AccessTime
            className={classNames(
              classes.forwardTime,
              expanded ? classes.expandedForwardTime : classes.collapsedForwardTime
            )}
          />
          {expanded && (
            <Typography variant="caption" className={classes.now}>
              NOW
            </Typography>
          )}
        </IconButton>
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
