import React, { useState, useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import classNames from "classnames";

import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import GlobalTimeControls from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { useRopData } from "../../../../../api";
import { COLOR_BY_GRAPH } from "../../../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

function TimeSliderContainer({ className, expanded, wellId, selectedMenuItems, setSelectedMenuItem }) {
  // Fetch data for Time Slider
  const ropData = useRopData();

  const [zoom, setZoom] = useState([0, 0]);
  const [maxSliderStep, setMaxSliderStep] = useState(1);
  const [sliderStep, setSliderStep] = useState([0, 1]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [globalDates, setGlobalDates] = useState(["", ""]);

  // Zoom constants
  const zoomInDisabled = maxSliderStep <= 10;
  const zoomOutDisabled = maxSliderStep >= ropData.length;

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
            <ZoomControls
              setZoom={setZoom}
              isZooming={isZooming}
              setIsZooming={setIsZooming}
              zoom={zoom}
              zoomInDisabled={zoomInDisabled}
              zoomOutDisabled={zoomOutDisabled}
            />
            <LocalTimeControls
              setIsPlaying={setIsPlaying}
              setSliderStep={setSliderStep}
              isPlaying={isPlaying}
              isSpeeding={isSpeeding}
              setIsSpeeding={setIsSpeeding}
              maxSliderStep={maxSliderStep}
            />
          </div>
          <VerticalMenu
            id="time-slider-menu"
            className={classes.timeSliderMenu}
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
        <Suspense fallback={<CircularProgress />}>
          <TimeSlider
            expanded={expanded}
            zoom={zoom}
            step={sliderStep[0]}
            setSliderStep={setSliderStep}
            setIsPlaying={setIsPlaying}
            selectedGraphs={selectedMenuItems}
            setGlobalDates={setGlobalDates}
            maxStep={maxSliderStep}
            setMaxStep={setMaxSliderStep}
            data={ropData}
          />
        </Suspense>
      </GlobalTimeControls>
    </Card>
  );
}

TimeSliderContainer.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool,
  setSelectedMenuItem: PropTypes.func,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  wellId: PropTypes.string
};

export default TimeSliderContainer;
