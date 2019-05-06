import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

function TimeSlider({ className, expanded }) {
  return (
    <Card className={classNames(classes.card, className)}>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.timeSliderTitle} variant="subtitle1" gutterBottom>
          Time Slider
        </Typography>
      </CardContent>
    </Card>
  );
}

TimeSlider.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool
};

export default TimeSlider;
