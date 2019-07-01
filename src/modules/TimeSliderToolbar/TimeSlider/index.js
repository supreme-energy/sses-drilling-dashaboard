import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import { useSize } from "react-hook-size";

import PixiContainer from "../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiBar from "./PixiBar";
import PixiLine from "../../WellExplorer/components/WellOverview/ROP/PixiLine";
import { useTimeSliderContainer, useDrillPhaseContainer } from "../../App/Containers";
import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import Slider from "./Slider";
import ZoomControls from "./ZoomControls";
import { GlobalStartTimeControl, GlobalEndTimeControl } from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { graphReducer, sliderReducer } from "./reducers";
import useViewport from "../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { useTimeSliderData } from "../../../api";
import { SURFACE } from "../../../constants/wellSections";
import {
  COLOR_BY_GRAPH,
  COLOR_BY_PHASE_VIEWER,
  GRID_GUTTER,
  MAP_BY_GRAPH,
  LINE_CHARTS,
  INITIAL_SLIDER_STATE
} from "../../../constants/timeSlider";
import {
  computeInitialViewXScaleValue,
  computeInitialViewYScaleValue,
  computePhaseXScaleValue
} from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

const TimeSlider = React.memo(({ wellId, expanded }) => {
  // Fetch data for Time Slider
  const data = useTimeSliderData();

  // Import shared state
  const { setSliderInterval, sliderInterval } = useTimeSliderContainer();
  const { setDrillPhase, drillPhaseObj } = useDrillPhaseContainer();

  // Create local state
  const [{ maxStep, step, stepSize, isDragging, isPlaying, isSpeeding }, setSliderStep] = useReducer(
    sliderReducer,
    INITIAL_SLIDER_STATE
  );

  const [globalDates, setGlobalDates] = useState(["", ""]);
  const [selectedMenuItems, setSelectedMenuItem] = useReducer(graphReducer, COLOR_BY_PHASE_VIEWER[SURFACE].graphs);

  // Get Previous drill phase value
  const prevDrillPhase = useRef();
  useEffect(() => {
    prevDrillPhase.current = drillPhaseObj;
  });
  const prevPhase = prevDrillPhase.current;

  // Canvas resizing hooks
  const scaleInitialized = useRef(null);
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);

  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewYScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewYScaleValue(data) : () => 1),
    [data]
  );

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data) : () => 1),
    [data]
  );

  // Determine if graph has been moved off screen by drag
  const isGraphWithinBounds = useCallback(
    (xScale, newX) => {
      return (
        data.length * xScale - Math.abs(newX) > width - GRID_GUTTER &&
        Math.round(step) <= Math.round(maxStep) &&
        newX / xScale < 0
      );
    },
    [width, data.length, step, maxStep]
  );

  const [view, updateView] = useState({
    x: GRID_GUTTER,
    y: 0,
    xScale: 0,
    yScale: 0
  });

  const viewportContainer = useRef(null);

  // Memoized selectors for Time Slider
  const holeDepthLeftIndex = useMemo(() => data.map(e => e.Hole_Depth).indexOf(drillPhaseObj.phaseStart), [
    data,
    drillPhaseObj.phaseStart
  ]);
  const holeDepthRightIndex = useMemo(() => data.map(e => e.Hole_Depth).lastIndexOf(drillPhaseObj.phaseEnd), [
    data,
    drillPhaseObj.phaseEnd
  ]);
  const w = width || maxStep * view.xScale + GRID_GUTTER;
  const stepFactor = step / maxStep;
  const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
  const hiddenDataLength = Math.abs(view.x / view.xScale);
  const rightBoundIndex = visibleDataLength + hiddenDataLength - 1;
  const leftBoundIndexMoving = Math.abs(view.x) / view.xScale;
  const stepIndex = stepFactor * visibleDataLength + leftBoundIndexMoving;

  const sliderDate = useMemo(() => {
    return _.get(data, `[${Math.round(stepIndex)}].Date_Time`);
  }, [data, stepIndex]);

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

  const onReset = useCallback(() => {
    if (holeDepthLeftIndex > 0 && holeDepthRightIndex > 0) {
      const isLastIndex = data.length - 1 <= holeDepthRightIndex;
      const beginningDate = _.get(data, `[${holeDepthLeftIndex}].Date_Time`, "");
      const endDate = !isLastIndex ? _.get(data, `[${holeDepthRightIndex}].Date_Time`, "") : "NOW";
      const indexDiff = holeDepthRightIndex - holeDepthLeftIndex;

      updateView(view => {
        const xScale = computePhaseXScaleValue(indexDiff)(w - GRID_GUTTER);
        return {
          x: -1 * holeDepthLeftIndex * xScale,
          y: 0,
          xScale,
          yScale: height ? getInitialViewYScaleValue(height) : view.yScale
        };
      });

      setSliderInterval([
        _.get(data, `[${Math.floor(holeDepthLeftIndex)}].Hole_Depth`),
        _.get(data, `[${Math.round(holeDepthRightIndex)}].Hole_Depth`)
      ]);

      setSliderStep({ type: "UPDATE", payload: { step: indexDiff, direction: 1, maxStep: indexDiff } });
      setGlobalDates([beginningDate, endDate]);
      setDrillPhase({ type: "SET", payload: { set: true } });
    }
  }, [
    data,
    getInitialViewYScaleValue,
    height,
    setSliderInterval,
    setDrillPhase,
    w,
    holeDepthLeftIndex,
    holeDepthRightIndex
  ]);

  // set initial scale
  useMemo(() => {
    if (
      data &&
      data.length &&
      ((width && height) || !expanded) &&
      (!scaleInitialized.current || (!_.isEqual(drillPhaseObj, prevPhase) && drillPhaseObj.set))
    ) {
      onReset();
      scaleInitialized.current = true;
    }
  }, [width, height, expanded, data, onReset, drillPhaseObj, prevPhase]);

  useEffect(() => {
    refresh();
  }, [refresh, stage, data, view, width, height, selectedMenuItems]);

  useEffect(() => {
    setSelectedMenuItem({ type: "CHANGE", payload: drillPhaseObj.phase });
  }, [drillPhaseObj.phase]);

  useEffect(() => {
    if (expanded && view.xScale && width) {
      const newMaxStep = Math.round((width - GRID_GUTTER) / view.xScale + 1);
      setSliderStep({ type: "UPDATE_FROM_PREVIOUS", payload: newMaxStep });
    }
  }, [expanded, view.xScale, width]);

  useEffect(() => {
    if (data && data.length && view.xScale) {
      if (
        (holeDepthLeftIndex > Math.round(hiddenDataLength) || holeDepthRightIndex < rightBoundIndex) &&
        drillPhaseObj.inView
      ) {
        setDrillPhase({ type: "UPDATE_VIEW", payload: false });
      } else if (
        holeDepthLeftIndex <= Math.round(hiddenDataLength) &&
        holeDepthRightIndex >= rightBoundIndex &&
        !drillPhaseObj.inView
      ) {
        setDrillPhase({ type: "UPDATE_VIEW", payload: true });
      }
    }
  }, [
    data,
    width,
    view,
    setDrillPhase,
    drillPhaseObj.inView,
    hiddenDataLength,
    holeDepthRightIndex,
    holeDepthLeftIndex,
    rightBoundIndex
  ]);

  useEffect(() => {
    if (data && data.length && step >= 0 && maxStep > 0 && leftBoundIndexMoving >= 0 && rightBoundIndex > 0) {
      const isLastDataIndex = data.length - 1 <= Math.round(rightBoundIndex);
      const beginningDateMoving = _.get(data, `[${Math.floor(leftBoundIndexMoving)}].Date_Time`, "");
      const endDateMoving = !isLastDataIndex ? _.get(data, `[${Math.round(rightBoundIndex)}].Date_Time`, "") : "NOW";

      setSliderInterval([
        _.get(data, `[${Math.round(leftBoundIndexMoving)}].Hole_Depth`),
        _.get(data, `[${Math.round(stepIndex)}].Hole_Depth`)
      ]);
      setGlobalDates([beginningDateMoving, endDateMoving]);
      setDrillPhase({ type: "SET", payload: { set: false } });
    }
  }, [
    data,
    view,
    width,
    step,
    maxStep,
    setSliderInterval,
    setDrillPhase,
    leftBoundIndexMoving,
    rightBoundIndex,
    stepIndex
  ]);

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
              updateView={updateView}
              step={step}
              maxStep={maxStep}
              dataSize={data.length}
              getInitialViewXScaleValue={getInitialViewXScaleValue}
              onReset={onReset}
              width={width}
            />
            <LocalTimeControls
              setSliderStep={setSliderStep}
              maxStep={maxStep}
              isPlaying={isPlaying}
              isSpeeding={isSpeeding}
            />
          </div>
          <VerticalMenu
            id="time-slider-menu"
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
          <div
            className={classNames(classes.timeSliderGraph, !expanded && classes.timeSliderGraphCollapsed)}
            ref={canvasRef}
          >
            <PixiContainer ref={viewportContainer} container={stage} />
            {selectedMenuItems.map(graph => {
              if (data.length > 0) {
                if (LINE_CHARTS.includes(graph)) {
                  return (
                    <PixiContainer
                      key={graph}
                      container={viewport}
                      child={container => (
                        <PixiLine
                          container={container}
                          data={data}
                          mapData={MAP_BY_GRAPH[graph]}
                          color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                        />
                      )}
                    />
                  );
                } else {
                  return (
                    <PixiContainer
                      key={graph}
                      container={viewport}
                      child={container => (
                        <PixiBar
                          container={container}
                          data={data}
                          mapData={MAP_BY_GRAPH[graph]}
                          color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                          width={1}
                          height={3500}
                          x={0}
                          y={0}
                        />
                      )}
                    />
                  );
                }
              }
            })}
          </div>
          <Slider
            expanded={expanded}
            step={step}
            isDragging={isDragging}
            maxStep={maxStep}
            setStep={setSliderStep}
            stepSize={stepSize}
            data={{ date: sliderDate, holeDepth: sliderInterval[1] }}
          />
        </div>
        <GlobalEndTimeControl setSliderStep={setSliderStep} expanded={expanded} date={globalDates[1]} />
      </div>
    </Card>
  );
});

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  wellId: PropTypes.string
};

export default TimeSlider;
