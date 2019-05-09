import React, { useState, useCallback, useReducer, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Typography, IconButton } from "@material-ui/core";
import {
  AccessTime,
  AddCircleOutline,
  Adjust,
  RemoveCircleOutline,
  PlayCircleOutline,
  PauseCircleOutline,
  FastRewind,
  FastForward,
  MoreVert,
  Restore
} from "@material-ui/icons";
import classNames from "classnames";

import TimeSlider from "./TimeSlider";
import classes from "./TimeSlider.scss";

export const STEP_VALUE = 1;
export const FORWARD = "FORWARD";
export const REWIND = "REWIND";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// TODO: Build Time Slider Component
function TimeSliderContainer({ className, expanded }) {
  const [zoom, setZoom] = useState(0);
  const [sliderStep, setSliderStep] = useState(0);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [buttonId, setButtonId] = useState("");

  const handleZoomOut = useCallback(() => {
    setZoom(zoom - STEP_VALUE);
  });

  const handleResetZoom = useCallback(() => {
    setZoom(0);
  });

  const handleZoomIn = useCallback(() => {
    setZoom(zoom + STEP_VALUE);
  });

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

  console.log(sliderStep);
  return (
    <Card className={classNames(classes.timeSliderContainer, className)}>
      {expanded && (
        <div className={classes.timeSliderHeader}>
          <Typography className={classes.timeSliderTitle} variant="subtitle1">
            Time Slider
          </Typography>
          <div className={classes.legend}>
            <div className={classNames(classes.legendKey, classes.slideLegendKey)} />
            <Typography variant="caption">Slide</Typography>
            <div className={classNames(classes.legendKey, classes.connectionLegendKey)} />
            <Typography variant="caption">Connection</Typography>
            <div className={classNames(classes.legendKey, classes.ropLegendKey)} />
            <Typography variant="caption">ROP</Typography>
            <div className={classNames(classes.legendKey, classes.lengthLegendKey)} />
            <Typography variant="caption">Length</Typography>
          </div>
          <div className={classes.timeSliderControls}>
            <div className={classes.zoomControls}>
              <IconButton onClick={handleZoomOut}>
                <RemoveCircleOutline />
              </IconButton>
              <IconButton onClick={handleResetZoom}>
                <Adjust />
              </IconButton>
              <IconButton onClick={handleZoomIn}>
                <AddCircleOutline />
              </IconButton>
            </div>
            <div className={classes.timeControls}>
              <IconButton id={REWIND} onMouseDown={onRewindDown} onMouseUp={onMouseUp}>
                <FastRewind id={REWIND} />
              </IconButton>
              <IconButton onClick={setIsPlaying}>
                {isPlaying ? <PauseCircleOutline /> : <PlayCircleOutline />}
              </IconButton>
              <IconButton id={FORWARD} onMouseDown={onForwardDown} onMouseUp={onMouseUp}>
                <FastForward id={FORWARD} />
              </IconButton>
            </div>
          </div>
          <IconButton className={classes.optionsButton}>
            <MoreVert />
          </IconButton>
        </div>
      )}
      <div className={classes.timeSliderView}>
        <div>
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
        </div>
        <TimeSlider expanded={expanded} zoom={zoom} step={sliderStep} />
        <div>
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
        </div>
      </div>
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool
};

export default TimeSliderContainer;
