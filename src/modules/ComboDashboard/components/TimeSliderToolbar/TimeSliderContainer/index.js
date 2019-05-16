import React, { useState, useReducer } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";

import MoreMenu from "../../MoreMenu/index";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import GlobalTimeControls from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import TimeSlider from "./TimeSlider";
import classes from "./TimeSlider.scss";

export const STEP_VALUE = 1;
export const FORWARD = "FORWARD";
export const REWIND = "REWIND";
export const DATA_TYPES = ["SLIDE", "CONNECTION", "ROP", "LENGTH"];

// TODO: Build Time Slider Component
function TimeSliderContainer({ className, expanded }) {
  const [zoom, setZoom] = useState([0, 0]);
  const [selectedMenuItems, setSelectedMenuItem] = useState(["ROP", "LENGTH"]);

  const [sliderStep, setSliderStep] = useState([100, 1]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  return (
    <Card className={classNames(classes.timeSliderContainer, className)}>
      {expanded && (
        <div className={classes.timeSliderHeader}>
          <Typography className={classes.timeSliderTitle} variant="subtitle1">
            Time Slider
          </Typography>
          <Legend selectedGraphs={selectedMenuItems} keys={DATA_TYPES} />
          <div className={classes.timeSliderControls}>
            <ZoomControls setZoom={setZoom} isZooming={isZooming} setIsZooming={setIsZooming} />
            <LocalTimeControls
              setIsPlaying={setIsPlaying}
              setSliderStep={setSliderStep}
              isPlaying={isPlaying}
              isSpeeding={isSpeeding}
              setIsSpeeding={setIsSpeeding}
            />
          </div>
          <MoreMenu
            id="time-slider-menu"
            selectedMenuItems={selectedMenuItems}
            setSelectedMenuItem={setSelectedMenuItem}
            menuItemEnum={DATA_TYPES}
            multiSelect
          />
        </div>
      )}
      <GlobalTimeControls setSliderStep={setSliderStep} expanded={expanded}>
        <TimeSlider
          expanded={expanded}
          zoom={zoom}
          step={sliderStep[0]}
          setSliderStep={setSliderStep}
          setIsPlaying={setIsPlaying}
          selectedGraphs={selectedMenuItems}
        />
      </GlobalTimeControls>
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool
};

export default TimeSliderContainer;
