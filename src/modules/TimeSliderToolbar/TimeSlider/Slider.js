import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Slider as SliderComponent } from "@material-ui/lab";

import { STEP_SIZE } from "../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

const Slider = React.memo(({ expanded, step, maxStep, setStep }) => {
  const handleDragSlider = useCallback(
    (_, step) => {
      setStep([step, 1]);
    },
    [setStep]
  );

  return (
    <SliderComponent
      className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
      value={step}
      max={maxStep}
      onChange={handleDragSlider}
      step={STEP_SIZE}
    />
  );
});

Slider.propTypes = {
  expanded: PropTypes.bool,
  step: PropTypes.number,
  maxStep: PropTypes.number,
  setStep: PropTypes.func
};

export default Slider;
