import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";
import classNames from "classnames";

import TimeSlider from "./TimeSlider";
import classes from "./TimeSlider.scss";

// TODO: Build Time Slider Component
function TimeSliderContainer({ className, expanded }) {
  return (
    <Card className={classNames(classes.timeSlider, className)}>
      {expanded && (
        <Typography className={classes.timeSliderTitle} variant="subtitle1" gutterBottom>
          Time Slider
        </Typography>
      )}
      <TimeSlider expanded={expanded} />
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool
};

export default TimeSliderContainer;
