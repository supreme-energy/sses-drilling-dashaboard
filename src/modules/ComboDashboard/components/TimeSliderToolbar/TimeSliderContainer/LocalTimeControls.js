import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { PlayCircleOutline, PauseCircleOutline, FastRewind, FastForward } from "@material-ui/icons";

import { STEP_VALUE } from "./index";
import { useInterval } from "./useInterval";
import classes from "./TimeSlider.scss";

export const FORWARD = "FORWARD";
export const REWIND = "REWIND";

let speedingTimeout;
function LocalTimeControls({ setSliderStep, setIsPlaying, isPlaying, isSpeeding, setIsSpeeding }) {
  const onPlayClick = useCallback(() => {
    setIsPlaying();
  });

  const onForwardDown = useCallback(() => {
    setSliderStep(sliderStep => [sliderStep[0] + STEP_VALUE, 1]);
    speedingTimeout = setTimeout(() => setIsSpeeding(true), 500);
  });

  const onRewindDown = useCallback(() => {
    setSliderStep(sliderStep => {
      if (sliderStep[0]) return [sliderStep[0] - STEP_VALUE, -1];
      return sliderStep;
    });
    speedingTimeout = setTimeout(() => setIsSpeeding(true), 500);
  });

  const onMouseUp = useCallback(() => {
    clearTimeout(speedingTimeout);
    setIsSpeeding(false);
  });

  useInterval(
    () => {
      setSliderStep(sliderStep => {
        if (sliderStep[0] >= 100) {
          return sliderStep;
        }
        return [sliderStep[0] + STEP_VALUE, sliderStep[1]];
      });
    },
    isPlaying && !isSpeeding ? 800 : null
  );

  useInterval(
    () => {
      setSliderStep(sliderStep => {
        if ((!sliderStep[0] && sliderStep[1] < 0) || (sliderStep[1] && sliderStep[0] >= 100)) {
          return sliderStep;
        }
        return [sliderStep[0] + STEP_VALUE * sliderStep[1], sliderStep[1]];
      });
    },
    isSpeeding ? 200 : null
  );

  console.log("isSpeeding", isSpeeding);

  return (
    <div className={classes.timeControls}>
      <IconButton onMouseDown={onRewindDown} onMouseUp={onMouseUp}>
        <FastRewind />
      </IconButton>
      <IconButton onClick={onPlayClick}>{isPlaying ? <PauseCircleOutline /> : <PlayCircleOutline />}</IconButton>
      <IconButton onMouseDown={onForwardDown} onMouseUp={onMouseUp}>
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
  setIsSpeeding: PropTypes.func
};

export default LocalTimeControls;
