import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { PlayCircleOutline, PauseCircleOutline, FastRewind, FastForward } from "@material-ui/icons";

import { STEP_VALUE } from "./index";
import { useInterval } from "./useInterval";
import classes from "./TimeSlider.scss";

export const FORWARD = "FORWARD";
export const REWIND = "REWIND";

function LocalTimeControls({ setSliderStep, setIsPlaying, isPlaying, sliderStep, setButtonId, buttonId }) {
  const onForwardDown = useCallback(() => {
    setSliderStep(sliderStep + STEP_VALUE);
    setButtonId(FORWARD);
  });

  const onRewindDown = useCallback(() => {
    if (sliderStep > 0) {
      setSliderStep(sliderStep - STEP_VALUE);
    }
    setButtonId(REWIND);
  });

  const onMouseUp = useCallback(() => {
    setButtonId("");
  });

  useInterval(
    () => {
      if (buttonId === FORWARD) {
        setSliderStep(sliderStep + STEP_VALUE);
      } else if (buttonId === REWIND) {
        if (sliderStep > 0) {
          setSliderStep(sliderStep - STEP_VALUE);
        }
      }
    },
    buttonId ? 500 : null
  );

  useInterval(
    () => {
      if (isPlaying) {
        setSliderStep(sliderStep + STEP_VALUE);
      }
    },
    isPlaying ? 1000 : null
  );

  return (
    <div className={classes.timeControls}>
      <IconButton id={REWIND} onMouseDown={onRewindDown} onMouseUp={onMouseUp}>
        <FastRewind id={REWIND} />
      </IconButton>
      <IconButton onClick={setIsPlaying}>{isPlaying ? <PauseCircleOutline /> : <PlayCircleOutline />}</IconButton>
      <IconButton id={FORWARD} onMouseDown={onForwardDown} onMouseUp={onMouseUp}>
        <FastForward id={FORWARD} />
      </IconButton>
    </div>
  );
}

LocalTimeControls.propTypes = {
  setSliderStep: PropTypes.func,
  sliderStep: PropTypes.number,
  setIsPlaying: PropTypes.func,
  isPlaying: PropTypes.bool,
  setButtonId: PropTypes.func,
  buttonId: PropTypes.string
};

export default LocalTimeControls;
