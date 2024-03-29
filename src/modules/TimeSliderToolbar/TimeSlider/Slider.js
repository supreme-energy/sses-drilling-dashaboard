import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Slider as SliderComponent } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

const useStyles = makeStyles({
  root: {
    "& span": {
      transform: "none",
      paddingLeft: 5
    }
  },
  valueLabelDraggingLeft: {
    color: "rgba(0,0,0,0.6)",
    left: 10,
    top: -25,
    "& *": {
      color: "#FFFFF",
      width: 150,
      borderRadius: 2
    }
  },
  valueLabelDraggingRight: {
    color: "rgba(0,0,0,0.6)",
    left: -150,
    top: -25,
    "& *": {
      color: "#FFFFF",
      width: 150,
      borderRadius: 2
    }
  },
  valueLabelDragging: {
    color: "rgba(0,0,0,0.6)",
    left: -75,
    top: -25,
    "& *": {
      color: "#FFFFF",
      width: 150,
      borderRadius: 2
    }
  },
  valueLabelRight: {
    textAlign: "right",
    left: -150,
    top: 28,
    "& *": {
      width: 150,
      color: "rgba(0,0,0,0.6)",
      background: "transparent"
    }
  },
  valueLabelLeft: {
    textAlign: "left",
    left: 0,
    top: 28,
    "& *": {
      width: 150,
      color: "rgba(0,0,0,0.6)",
      background: "transparent"
    }
  },
  valueLabel: {
    textAlign: "center",
    left: -55,
    top: 28,
    "& *": {
      width: 150,
      color: "rgba(0,0,0,0.6)",
      background: "transparent"
    }
  }
});

const Slider = React.memo(
  ({ expanded, step, maxStep, setStep, isDragging, stepSize, data: { holeDepth = 0, date } }) => {
    const muiClasses = useStyles();

    const leftBound = step / maxStep <= 0.1;
    const rightBound = step / maxStep >= 0.9;

    const handleDragSlider = useCallback(
      (_, step) => setStep({ type: "UPDATE", payload: { step, isDragging: true } }),
      [setStep]
    );

    const handleMouseUp = useCallback(() => {
      setStep({ type: "UPDATE", payload: { isDragging: false } });
    }, [setStep]);

    const labelFormat = useCallback(() => {
      if (!holeDepth) return null;

      return (
        <div>
          {`MD: ${holeDepth}`}
          <br />
          {date}
        </div>
      );
    }, [holeDepth, date]);

    return (
      <SliderComponent
        className={classNames(expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed)}
        classes={{
          root: muiClasses.root,
          valueLabel: isDragging
            ? leftBound
              ? muiClasses.valueLabelDraggingLeft
              : rightBound
              ? muiClasses.valueLabelDraggingRight
              : muiClasses.valueLabelDragging
            : leftBound
            ? muiClasses.valueLabelLeft
            : rightBound
            ? muiClasses.valueLabelRight
            : muiClasses.valueLabel
        }}
        value={step}
        max={maxStep}
        onChange={handleDragSlider}
        onChangeCommitted={handleMouseUp}
        step={stepSize}
        valueLabelFormat={labelFormat}
        valueLabelDisplay={expanded ? "on" : "auto"}
      />
    );
  }
);

Slider.propTypes = {
  expanded: PropTypes.bool,
  step: PropTypes.number,
  maxStep: PropTypes.number,
  setStep: PropTypes.func
};

export default Slider;
