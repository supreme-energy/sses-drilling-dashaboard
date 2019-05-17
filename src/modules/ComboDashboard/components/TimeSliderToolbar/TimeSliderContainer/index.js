import React, { useState, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";

import MoreMenu from "../../MoreMenu/index";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import GlobalTimeControls from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import TimeSlider from "./TimeSlider";
import { useRopData } from "./TimeSlider/TimeSliderUtil";
import { COLOR_BY_GRAPH, COLOR_BY_PHASE_VIEWER } from "../../../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

// TODO: Build Time Slider Component
function TimeSliderContainer({ className, expanded, drillPhase }) {
  // Fetch data for Time Slider
  const data = useRopData();
  const maxSliderStep = data.length;

  const [zoom, setZoom] = useState([0, 0]);
  const [selectedMenuItems, setSelectedMenuItem] = useState(COLOR_BY_PHASE_VIEWER[drillPhase].graphs);
  const [sliderStep, setSliderStep] = useState([maxSliderStep, 1]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [globalDates, setGlobalDates] = useState(["", ""]);

  useEffect(() => {
    setSliderStep([maxSliderStep, 1]);
  }, [maxSliderStep]);

  useEffect(() => {
    setSelectedMenuItem(COLOR_BY_PHASE_VIEWER[drillPhase].graphs);
  }, [drillPhase]);

  return (
    <Card
      className={classNames(classes.timeSliderContainer, expanded && classes.timeSliderContainerExpanded, className)}
    >
      {expanded && (
        <div className={classes.timeSliderHeader}>
          <Typography className={classes.timeSliderTitle} variant="subtitle1">
            Time Slider
          </Typography>
          <Legend selectedGraphs={selectedMenuItems} keys={Object.keys(COLOR_BY_GRAPH)} />
          <div className={classes.timeSliderControls}>
            <ZoomControls setZoom={setZoom} isZooming={isZooming} setIsZooming={setIsZooming} />
            <LocalTimeControls
              setIsPlaying={setIsPlaying}
              setSliderStep={setSliderStep}
              isPlaying={isPlaying}
              isSpeeding={isSpeeding}
              setIsSpeeding={setIsSpeeding}
              maxSliderStep={maxSliderStep}
            />
          </div>
          <MoreMenu
            id="time-slider-menu"
            selectedMenuItems={selectedMenuItems}
            setSelectedMenuItem={setSelectedMenuItem}
            menuItemEnum={Object.keys(COLOR_BY_GRAPH)}
            multiSelect
          />
        </div>
      )}
      <GlobalTimeControls
        setSliderStep={setSliderStep}
        expanded={expanded}
        dates={globalDates}
        maxSliderStep={maxSliderStep}
      >
        <TimeSlider
          expanded={expanded}
          zoom={zoom}
          step={sliderStep[0]}
          setSliderStep={setSliderStep}
          setIsPlaying={setIsPlaying}
          selectedGraphs={selectedMenuItems}
          setGlobalDates={setGlobalDates}
          maxStep={maxSliderStep}
          data={data}
        />
      </GlobalTimeControls>
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool,
  drillPhase: PropTypes.string
};

export default TimeSliderContainer;
