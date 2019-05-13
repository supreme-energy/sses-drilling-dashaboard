import React, { useState, useCallback, useReducer, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, ClickAwayListener, Menu, Typography, IconButton, MenuItem } from "@material-ui/core";
import {
  AccessTime,
  AddCircleOutline,
  Adjust,
  CheckCircle,
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
const DATA_TYPES = ["Slide", "Connection", "ROP", "Length"];

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
  const [zoom, setZoom] = useState([0, 0]);

  const [sliderStep, setSliderStep] = useState(0);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [buttonId, setButtonId] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(["ROP"]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleZoomOut = useCallback(() => {
    setZoom(zoom => [zoom[0] - STEP_VALUE, -1]);
  });

  const handleResetZoom = useCallback(() => {
    setZoom([0, 0]);
  });

  const handleZoomIn = useCallback(() => {
    setZoom(zoom => [zoom[0] + STEP_VALUE, 1]);
  });

  const handleSetBeginning = useCallback(() => {
    setSliderStep(0);
  });

  const handleSetEnd = useCallback(() => {
    setSliderStep(100);
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

  return (
    <Card className={classNames(classes.timeSliderContainer, className)}>
      {expanded && (
        <div className={classes.timeSliderHeader}>
          <Typography className={classes.timeSliderTitle} variant="subtitle1">
            Time Slider
          </Typography>
          <div className={classes.legend}>
            {DATA_TYPES.map((type, index) => {
              if (selectedTypes.includes(type)) {
                console.log(typeof `classes.${type.toLowerCase()}LegendKey`);
                return (
                  <React.Fragment key={index}>
                    <div className={classNames(classes.legendKey, classes[`${type.toLowerCase()}LegendKey`])} />
                    <Typography variant="caption">{type}</Typography>
                  </React.Fragment>
                );
              }
            })}
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
          <IconButton
            className={classes.optionsButton}
            aria-owns={selectedTypes.length ? "drill-phase-menu" : undefined}
            aria-haspopup="true"
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <MoreVert />
            <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
              <div>
                <Menu id="drill-phase-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} disableAutoFocusItem>
                  {DATA_TYPES.map((type, index) => {
                    const selected = selectedTypes.includes(type);
                    return (
                      <MenuItem
                        key={index}
                        className={selected ? classes.selectedMenuItem : classes.phaseMenuItem}
                        onClick={() => setSelectedTypes(type)}
                      >
                        <div className={classes.phaseCodeBuffer}>{type}</div>
                        {selected && <CheckCircle className={classes.selectedPhase} />}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </div>
            </ClickAwayListener>
          </IconButton>
        </div>
      )}
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
        <TimeSlider
          expanded={expanded}
          zoom={zoom}
          step={sliderStep}
          setSliderStep={setSliderStep}
          setIsPlaying={setIsPlaying}
        />
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
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool
};

export default TimeSliderContainer;
