import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import Progress from "@material-ui/core/CircularProgress";
import classNames from "classnames";
import get from "lodash/get";
import { useSize } from "react-hook-size";

import { useTimeSliderContainer } from "../../App/Containers";
import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import ZoomControls from "./ZoomControls";
import { GlobalStartTimeControl, GlobalEndTimeControl } from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import useViewport from "../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { useRopData } from "../../../api";
import { COLOR_BY_GRAPH, GRID_GUTTER } from "../../../constants/timeSlider";
import Slider from "./Slider";
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue } from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

const Graphs = lazy(() => import(/* webpackChunkName: 'TimeSliderGraphs' */ "./Graphs"));

function TimeSlider({ expanded, selectedMenuItems, setSelectedMenuItem, wellId }) {
  // Fetch data for Time Slider
  const data = useRopData();

  const { setSliderInterval } = useTimeSliderContainer();

  const [maxSliderStep, setMaxSliderStep] = useState(0);
  const [sliderStep, setSliderStep] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useReducer(a => !a, false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [zoomType, setZoomType] = useState();
  const [globalDates, setGlobalDates] = useState(["", ""]);

  // Canvas resizing hooks
  const scaleInitialized = useRef(null);
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);

  // Determine if graph has been moved off screen by drag
  const isGraphWithinBounds = useCallback(
    (xScale, newX) => {
      return data.length * xScale - Math.abs(newX) > width - GRID_GUTTER && sliderStep[0] <= maxSliderStep;
    },
    [width, data.length, sliderStep, maxSliderStep]
  );

  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

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
    xScale: 0,
    yScale: 0
  });

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: 0,
      y: 0,
      yScale: getInitialViewYScaleValue(height),
      xScale: getInitialViewXScaleValue(width - GRID_GUTTER)
    }));

    setSliderStep(step => [data.length - 1, step[1]]);
    setMaxSliderStep(data.length - 1);
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height, data.length]);

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: true,
    zoomYScale: false,
    isXScalingValid: isGraphWithinBounds
  });

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (data && data.length && width && height && !scaleInitialized.current) {
        onReset();
        scaleInitialized.current = true;
      }
    },
    [width, data, height, onReset]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, data, view, width, height, selectedMenuItems]
  );

  useEffect(() => {
    const newMaxStep = (width - GRID_GUTTER) / view.xScale - 1;
    if (expanded && newMaxStep > 0) {
      setMaxSliderStep(prevMaxStep => {
        setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
        return newMaxStep;
      });
    }
  }, [width, expanded, view.xScale]);

  useEffect(() => {
    if (expanded && data && data.length && maxSliderStep > 0) {
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
    }
  }, [width, expanded, view, data, setSliderInterval, maxSliderStep, sliderStep]);

  // Zoom constants
  const zoomInDisabled = maxSliderStep <= 10;
  const zoomOutDisabled = maxSliderStep >= data.length;

  return (
    <Card className={classNames(classes.timeSliderContainer, expanded && classes.timeSliderContainerExpanded)}>
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
      <div className={classes.timeSliderView}>
        <GlobalStartTimeControl setSliderStep={setSliderStep} expanded={expanded} date={globalDates[0]} />
        <div className={classNames(classes.timeSlider, expanded && classes.timeSliderExpanded)}>
          <Suspense fallback={<Progress />}>
            <div
              className={classNames(classes.timeSliderGraph, !expanded && classes.timeSliderGraphCollapsed)}
              ref={canvasRef}
            >
              <Graphs
                data={data}
                viewportContainer={viewportContainer}
                stage={stage}
                selectedMenuItems={selectedMenuItems}
                viewport={viewport}
              />
            </div>
          </Suspense>
          <Slider expanded={expanded} step={sliderStep[0]} maxStep={maxSliderStep} setStep={setSliderStep} />
        </div>
        <GlobalEndTimeControl
          setSliderStep={setSliderStep}
          expanded={expanded}
          date={globalDates[1]}
          maxSliderStep={maxSliderStep}
        />
      </div>
    </Card>
  );
}

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  setSelectedMenuItem: PropTypes.func,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  wellId: PropTypes.string
};

export default TimeSlider;
