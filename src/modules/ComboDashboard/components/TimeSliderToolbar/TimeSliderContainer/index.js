import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import classNames from "classnames";
import get from "lodash/get";

import { useTimeSliderContainer } from "../../../../App/Containers";
import { useRopData } from "../../../../../api";
import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import GlobalTimeControls from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { COLOR_BY_GRAPH, GRID_GUTTER } from "../../../../../constants/timeSlider";
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue } from "./TimeSlider/TimeSliderUtil";
import classes from "./TimeSlider.scss";

const TimeSlider = lazy(() => import(/* webpackChunkName: 'TimeSlider' */ "./TimeSlider"));

function TimeSliderContainer({ className, expanded, wellId, selectedMenuItems, setSelectedMenuItem }) {
  // Fetch data for Time Slider
  const data = useRopData(wellId);

  const { setSliderInterval } = useTimeSliderContainer();

  const [maxSliderStep, setMaxSliderStep] = useState(1);
  const [sliderStep, setSliderStep] = useState([0, 1]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [zoomType, setZoomType] = useState();
  const [globalDates, setGlobalDates] = useState(["", ""]);

  // Canvas resizing hooks
  const scaleInitialized = useRef(false);
  const canvasRef = useRef(null);
  const obs = useRef();
  const [{ width, height }, setSize] = useState({ width: null, height: null });
  const item = canvasRef.current;

  // Monitor window for resize
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

  // set initial scale
  useEffect(() => {
    if (data && data.length && width && height && !scaleInitialized.current) {
      onReset();
      scaleInitialized.current = true;
    }
  }, [width, data, height, onReset]);

  useEffect(() => {
    if (data.length) {
      setSliderStep(step => [data.length - 1, step[1]]);
      setMaxSliderStep(data.length - 1);
    }
  }, [data, setMaxSliderStep]);

  useEffect(() => {
    if (expanded) onReset();
  }, [expanded, onReset]);

  useEffect(() => {
    const newMaxStep = (width - GRID_GUTTER) / view.xScale - 1;
    if (expanded && newMaxStep > 0) {
      setMaxSliderStep(prevMaxStep => {
        setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
        return newMaxStep;
      });
    }
  }, [setMaxSliderStep, setSliderStep, width, expanded, view.xScale]);

  useEffect(() => {
    const stepFactor = sliderStep[0] / maxSliderStep;
    const hiddenDataLength = Math.abs(view.x) / view.xScale;
    const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
    const endDataIndex = stepFactor * (visibleDataLength - 1) + hiddenDataLength;

    const beginningDate = get(data, `[${Math.floor(hiddenDataLength)}].Date_Time`, "");
    const endDate = get(data, `[${Math.round(endDataIndex)}].Date_Time`, "NOW");

    setSliderInterval([
      get(data, `[${Math.floor(hiddenDataLength)}].Hole_Depth`),
      get(data, `[${Math.round(endDataIndex)}].Hole_Depth`)
    ]);

    setGlobalDates([beginningDate, endDate]);
  }, [data, setGlobalDates, width, view, sliderStep, maxSliderStep, setSliderInterval]);

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
