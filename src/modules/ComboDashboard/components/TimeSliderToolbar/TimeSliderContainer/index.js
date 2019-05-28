import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import classNames from "classnames";
import get from "lodash/get";

import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import GlobalTimeControls from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { useRopData } from "../../../../../api";
import { COLOR_BY_GRAPH, GRID_GUTTER } from "../../../../../constants/timeSlider";
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue } from "./TimeSlider/TimeSliderUtil";
import classes from "./TimeSlider.scss";

const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

function TimeSliderContainer({ className, expanded, wellId, selectedMenuItems, setSelectedMenuItem }) {
  // Fetch data for Time Slider
  const data = useRopData();

  // Handle window resize
  const canvasRef = useRef(null);
  const obs = useRef();
  const [{ width, height }, setSize] = useState({ width: null, height: null });
  const item = canvasRef.current;

  useEffect(() => {
    function observe(entries) {
      const { width, height } = entries[0].contentRect;
      setSize(s => (s.width !== width || s.height !== height ? { width, height } : s));
    }
    const RObserver = window.ResizeObserver || require("resize-observer-polyfill").default;
    obs.current = new RObserver(observe);
    if (item) {
      obs.current.observe(item);
    }

    return () => {
      item && obs.current.unobserve(item);
      obs.current.disconnect();
    };
  }, [item]);

  const [maxSliderStep, setMaxSliderStep] = useState(1);
  const [sliderStep, setSliderStep] = useState([0, 1]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [zoomType, setZoomType] = useState(false);
  const [globalDates, setGlobalDates] = useState(["", ""]);

  const getInitialViewYScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewYScaleValue(data) : () => 1),
    [data]
  );

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data) : () => 1),
    [data]
  );

  const [view, updateView] = useState({
    x: GRID_GUTTER,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: 0,
      y: 0,
      yScale: getInitialViewYScaleValue(height),
      xScale: getInitialViewXScaleValue(width - GRID_GUTTER)
    }));
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height]);

  useEffect(() => {
    setMaxSliderStep(data.length);
  }, [data, setMaxSliderStep]);

  useEffect(() => {
    setSliderStep(step => [data.length, step[1]]);
  }, [data, setSliderStep]);

  useEffect(() => {
    if (expanded) onReset();
  }, [expanded, onReset]);

  useEffect(() => {
    if (expanded) {
      setMaxSliderStep(prevMaxStep => {
        const newMaxStep = (width - GRID_GUTTER) / view.xScale;
        setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
        return newMaxStep;
      });
    }
  }, [setMaxSliderStep, setSliderStep, width, expanded, view.xScale]);

  useEffect(() => {
    const stepFactor = sliderStep / maxSliderStep;
    const hiddenDataLength = Math.abs(view.x) / view.xScale;
    const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
    const endDataIndex = stepFactor ? stepFactor * visibleDataLength + hiddenDataLength - 1 : 0;

    const beginningDate = get(data, `[${hiddenDataLength}].Date_Time`, "");
    const endDate = get(data, `[${Math.ceil(endDataIndex)}].Date_Time`, "NOW");

    setGlobalDates([beginningDate, endDate]);
  }, [data, setGlobalDates, width, view, sliderStep, maxSliderStep]);

  // Zoom constants
  const zoomInDisabled = maxSliderStep <= 10;
  const zoomOutDisabled = maxSliderStep >= data.length;

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
              zoomType={zoomType}
              setZoomType={setZoomType}
              zoomInDisabled={zoomInDisabled}
              zoomOutDisabled={zoomOutDisabled}
              updateView={updateView}
              step={sliderStep[0]}
              maxSliderStep={maxSliderStep}
              dataSize={data.length}
              getInitialViewXScaleValue={getInitialViewXScaleValue}
              onReset={onReset}
              width={width}
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
            step={sliderStep[0]}
            setSliderStep={setSliderStep}
            selectedGraphs={selectedMenuItems}
            maxStep={maxSliderStep}
            setMaxStep={setMaxSliderStep}
            data={data}
            view={view}
            updateView={updateView}
            height={height}
            width={width}
            onReset={onReset}
            ref={canvasRef}
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
