import React, { useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { PlayCircleOutline, PauseCircleOutline, FastRewind, FastForward } from "@material-ui/icons";

import { useInterval } from "./useInterval";
import classes from "./TimeSlider.scss";

const LocalTimeControls = React.memo(({ setSliderStep, maxSliderStep, isSpeeding, isPlaying }) => {
  let speedingTimeout = useRef(null);

  const onPlayClick = useCallback(() => {
    setSliderStep({ type: "IS_PLAYING" });
  }, [setSliderStep]);

  const onForwardDown = useCallback(() => {
    setSliderStep({ type: "FAST_FORWARD" });
    speedingTimeout.current = setTimeout(() => setSliderStep({ type: "UPDATE", payload: { isSpeeding: true } }), 500);
  }, [setSliderStep]);

  const onRewindDown = useCallback(() => {
    setSliderStep({ type: "REWIND" });
    speedingTimeout.current = setTimeout(() => setSliderStep({ type: "UPDATE", payload: { isSpeeding: true } }), 500);
  }, [setSliderStep]);

  const onMouseUp = useCallback(() => {
    clearTimeout(speedingTimeout.current);
    setSliderStep({ type: "UPDATE", payload: { isSpeeding: false } });
  }, [setSliderStep]);

  useInterval(() => setSliderStep({ type: "IS_PLAYING" }), isPlaying && !isSpeeding ? 800 : null);
  useInterval(() => setSliderStep({ type: "IS_SPEEDING" }), isSpeeding ? 100 : null);

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
});

LocalTimeControls.propTypes = {
  setSliderStep: PropTypes.func,
  maxSliderStep: PropTypes.number
};

export default LocalTimeControls;
