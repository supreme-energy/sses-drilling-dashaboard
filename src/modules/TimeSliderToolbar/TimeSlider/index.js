import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import { useSize } from "react-hook-size";
import { max, min } from "d3-array";

import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiBar from "./PixiBar";
import PixiContainer from "../../../components/PixiContainer";
import PixiLine from "../../../components/PixiLine";
import { useTimeSliderContainer, useDrillPhaseContainer, useWellSections } from "../../App/Containers";
import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import Slider from "./Slider";
import ZoomControls from "./ZoomControls";
import QuickFilter from "./QuickFilter";
import { GlobalStartTimeControl, GlobalEndTimeControl } from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { graphReducer, sliderReducer } from "./reducers";
import useViewport from "../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../hooks/useWebGLRenderer";
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
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue } from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

const TimeSlider = React.memo(({ wellId, expanded }) => {
  // Fetch data for Time Slider
  const data = useTimeSliderData();
  const wellSections = useWellSections(wellId);

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
  const sliderRef = useRef(null);
  const { width, height } = useSize(sliderRef);

  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewYScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewYScaleValue(data) : () => 1),
    [data]
  );

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data.length) : () => 1),
    [data]
  );

  const [view, updateView] = useState({
    x: GRID_GUTTER,
    y: 0,
    xScale: 1,
    yScale: 1
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

  const calcBounds = value => (data.length - 1 >= value ? value : data.length - 1);
  const stepFactor = step / maxStep;
  const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
  const leftBoundIndexMoving = Math.abs(view.x / view.xScale);

  const rightBoundIndex = calcBounds(visibleDataLength + leftBoundIndexMoving);
  const stepIndex = calcBounds(stepFactor * visibleDataLength + leftBoundIndexMoving);
  const dataMin = useMemo(() => min(data, d => d.ROP_A), [data]);
  const barHeight = useMemo(() => max(data, d => d.ROP_A) - dataMin, [dataMin, data]);

  const isGraphWithinBounds = useCallback(
    (xScale, newX) => {
      return (
        visibleDataLength + leftBoundIndexMoving <= data.length &&
        stepFactor * visibleDataLength + leftBoundIndexMoving <= data.length - 1 &&
        (data.length - 1) * xScale - Math.abs(newX) > width - 6 &&
        Math.round(step) <= Math.round(maxStep) &&
        newX / xScale < 0
      );
    },
    [width, data.length, step, maxStep, leftBoundIndexMoving, stepFactor, visibleDataLength]
  );

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
        const xScale = computeInitialViewXScaleValue(indexDiff)(width - GRID_GUTTER);
        return {
          x: -1 * holeDepthLeftIndex * xScale,
          y: 52,
          xScale,
          yScale: height ? getInitialViewYScaleValue(dataMin - 50) : view.yScale
        };
      });

      setGlobalDates([beginningDate, endDate]);

      setSliderInterval({
        firstDepth: _.get(data, `[${Math.floor(holeDepthLeftIndex)}].Hole_Depth`),
        lastDepth: _.get(data, `[${Math.round(holeDepthRightIndex)}].Hole_Depth`),
        isLastIndex
      });

      setSliderStep({ type: "UPDATE", payload: { step: indexDiff, direction: 1, maxStep: indexDiff } });
      setDrillPhase({ type: "SET", payload: { set: false } });
    }
  }, [
    data,
    dataMin,
    getInitialViewYScaleValue,
    height,
    setSliderInterval,
    width,
    holeDepthLeftIndex,
    holeDepthRightIndex,
    setDrillPhase
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
        (holeDepthLeftIndex > Math.round(leftBoundIndexMoving) || holeDepthRightIndex < rightBoundIndex) &&
        drillPhaseObj.inView
      ) {
        setDrillPhase({ type: "UPDATE_VIEW", payload: false });
      } else if (
        holeDepthLeftIndex <= Math.round(leftBoundIndexMoving) &&
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
    leftBoundIndexMoving,
    holeDepthRightIndex,
    holeDepthLeftIndex,
    rightBoundIndex
  ]);

  useEffect(() => {
    if (data && data.length && step >= 0 && maxStep > 0 && leftBoundIndexMoving >= 0 && rightBoundIndex > 0) {
      const isLastDataIndex = data.length - 1 <= Math.round(rightBoundIndex);
      const beginningDateMoving = _.get(data, `[${Math.floor(leftBoundIndexMoving)}].Date_Time`, "");
      const endDateMoving = !isLastDataIndex ? _.get(data, `[${Math.round(rightBoundIndex)}].Date_Time`, "") : "NOW";

      setSliderInterval({
        firstDepth: _.get(data, `[${Math.round(leftBoundIndexMoving)}].Hole_Depth`),
        lastDepth: _.get(data, `[${Math.round(stepIndex)}].Hole_Depth`, data[data.length - 1].Hole_Depth),
        isLastIndex: isLastDataIndex
      });

      setGlobalDates([beginningDateMoving, endDateMoving]);
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
            <LocalTimeControls setSliderStep={setSliderStep} isPlaying={isPlaying} isSpeeding={isSpeeding} />
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
        <div className={classNames(classes.timeSlider)} ref={sliderRef}>
          <div
            className={classNames(classes.timeSliderGraph, !expanded && classes.timeSliderGraphCollapsed)}
            ref={canvasRef}
          >
            <PixiContainer ref={viewportContainer} container={stage} />

            <PixiContainer
              container={viewport}
              child={container => {
                return (
                  <React.Fragment>
                    {selectedMenuItems.map(graph => {
                      if (data.length > 0) {
                        if (LINE_CHARTS.includes(graph)) {
                          return (
                            <PixiLine
                              key={graph}
                              container={container}
                              data={data}
                              mapData={MAP_BY_GRAPH[graph]}
                              color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                            />
                          );
                        } else {
                          return (
                            <PixiBar
                              key={graph}
                              container={container}
                              data={data}
                              mapData={MAP_BY_GRAPH[graph]}
                              color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                              width={1}
                              height={barHeight}
                              x={0}
                              y={dataMin / 2}
                              alpha={0.4}
                              zIndex={50}
                            />
                          );
                        }
                      }
                    })}
                  </React.Fragment>
                );
              }}
            />

            <PixiContainer
              updateTransform={frozenScaleTransform}
              container={viewport}
              child={container => {
                return wellSections.map((phaseObj, index) => (
                  <QuickFilter
                    key={phaseObj.phase + index}
                    wellId={wellId}
                    container={container}
                    data={data}
                    phaseObj={phaseObj}
                    setDrillPhase={setDrillPhase}
                    view={view}
                    refresh={refresh}
                  />
                ));
              }}
            />
          </div>
          <Slider
            expanded={expanded}
            step={step}
            isDragging={isDragging}
            maxStep={maxStep}
            setStep={setSliderStep}
            stepSize={stepSize}
            data={{ date: sliderDate, holeDepth: sliderInterval.lastDepth }}
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
