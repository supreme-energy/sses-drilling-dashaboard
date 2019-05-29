import React, { useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { PlayCircleOutline, PauseCircleOutline, FastRewind, FastForward } from "@material-ui/icons";

import { useInterval } from "./useInterval";
import { STEP_SIZE } from "../../../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

function LocalTimeControls({ setSliderStep, setIsPlaying, isPlaying, isSpeeding, setIsSpeeding, maxSliderStep }) {
  let speedingTimeout = useRef(null);

  const onPlayClick = useCallback(() => {
    setIsPlaying();
  }, [setIsPlaying]);

  const onForwardDown = useCallback(() => {
    setSliderStep(sliderStep => {
      const newStep = sliderStep[0] + STEP_SIZE;

      if (newStep <= maxSliderStep) return [newStep, 1];
      return sliderStep;
    });
    speedingTimeout.current = setTimeout(() => setIsSpeeding(true), 500);
  }, [setSliderStep, setIsSpeeding, maxSliderStep]);

  const onRewindDown = useCallback(() => {
    setSliderStep(sliderStep => {
      const newStep = sliderStep[0] - STEP_SIZE;

      if (sliderStep[0] && newStep >= 0) return [newStep, -1];
      return sliderStep;
    });
    speedingTimeout.current = setTimeout(() => setIsSpeeding(true), 500);
  }, [setIsSpeeding, setSliderStep]);

  const onMouseUp = useCallback(() => {
    clearTimeout(speedingTimeout.current);
    setIsSpeeding(false);
  }, [setIsSpeeding]);

  useInterval(
    () => {
      setSliderStep(sliderStep => {
        const stepFactor = STEP_SIZE * Math.ceil(maxSliderStep / 100);
        const nextStep = sliderStep[0] + stepFactor;
        // Stop playing if slider reaches max step
        if (nextStep >= maxSliderStep) {
          setIsPlaying(false);
          return [maxSliderStep, 0];
        }

        // Otherwise return next slider step
        return [nextStep, sliderStep[1]];
      });
    },
    isPlaying && !isSpeeding ? 800 : null
  );

  useInterval(
    () => {
      setSliderStep(sliderStep => {
        const stepFactor = STEP_SIZE * (maxSliderStep / 50) * sliderStep[1];
        const nextStep = sliderStep[0] + stepFactor;

        // If slider step is at min or max, don't move anymore
        if (nextStep <= 0 && sliderStep[1] < 0) {
          return [0, 0];
        } else if (sliderStep[1] && nextStep >= maxSliderStep) {
          return [maxSliderStep, 0];
        }

        // Otherwise return next slider step
        return [nextStep, sliderStep[1]];
      });
    },
    isSpeeding ? 100 : null
  );

  useEffect(() => {
    // Stop zoom if mouseup happens outside component
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseUp]);

  return (
    <div className={classes.timeControls}>
      <IconButton onMouseDown={onRewindDown}>
        <FastRewind />
      </IconButton>
      <IconButton onClick={onPlayClick}>{isPlaying ? <PauseCircleOutline /> : <PlayCircleOutline />}</IconButton>
      <IconButton onMouseDown={onForwardDown}>
        <FastForward />
      </IconButton>
    </div>
  );
}

LocalTimeControls.propTypes = {
  setSliderStep: PropTypes.func,
  setIsPlaying: PropTypes.func,
  isPlaying: PropTypes.bool,
  isSpeeding: PropTypes.bool,
  setIsSpeeding: PropTypes.func,
  maxSliderStep: PropTypes.number
};

export default LocalTimeControls;
