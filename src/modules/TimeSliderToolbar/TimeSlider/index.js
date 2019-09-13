import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import { useSize } from "react-hook-size";
import { max, min } from "d3-array";
import usePrevious from "react-use/lib/usePrevious";

import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiContainer from "../../../components/PixiContainer";
import PixiLine from "../../../components/PixiLine";
import PixiBar from "../../../components/PixiBar";
import {
  useTimeSliderContainer,
  useDrillPhaseContainer,
  useWellSections,
  useSurveysDataContainer,
  useProjectionsDataContainer
} from "../../App/Containers";
import VerticalMenu from "../../../components/VerticalMenu";
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
import { SURFACE, ALL } from "../../../constants/wellSections";
import {
  COLOR_BY_GRAPH,
  COLOR_BY_PHASE_VIEWER,
  GRID_GUTTER,
  MAP_BY_GRAPH,
  LINE_CHARTS,
  INITIAL_SLIDER_STATE
} from "../../../constants/timeSlider";
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue, calcBounds } from "./TimeSliderUtil";
import classes from "./TimeSlider.scss";

const TimeSlider = React.memo(({ wellId, expanded }) => {
  // Import shared state
  const { setSliderInterval, sliderInterval } = useTimeSliderContainer();
  const { setDrillPhase, drillPhaseObj } = useDrillPhaseContainer();
  const prevPhase = usePrevious(drillPhaseObj);
  const { surveys } = useSurveysDataContainer();
  const { projectionsData: projections } = useProjectionsDataContainer();
  const wellSections = useWellSections(wellId);

  // Calc inputs for Time Slider data
  // These assume that surveys and projections are always in order
  // Which should remain as is for performance
  const hasSurveys = surveys && surveys.length;
  const hasProjections = projections && projections.length;
  const minSurveyDepth = hasSurveys && surveys[0].md;
  const maxSurveyDepth = hasSurveys && surveys[surveys.length - 1].md;
  const maxProjectionDepth = hasProjections && projections[projections.length - 1].md;

  const { data, getTimeSliderData } = useTimeSliderData();

  // Create local state
  const [{ maxStep, step, stepSize, isDragging, isPlaying, isSpeeding }, setSliderStep] = useReducer(
    sliderReducer,
    INITIAL_SLIDER_STATE
  );

  const [globalDates, setGlobalDates] = useState(["", ""]);
  const [selectedMenuItems, setSelectedMenuItem] = useReducer(graphReducer, COLOR_BY_PHASE_VIEWER[SURFACE].graphs);

  // Canvas resizing hooks
  const scaleInitialized = useRef(null);
  const canvasRef = useRef(null);
  const sliderRef = useRef(null);
  const { width, height } = useSize(sliderRef);
  const hasFetchedTimeSliderData = useRef(false);

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
  const holeDepthLeftIndex = useMemo(() => {
    const index = data.findIndex(d => d.hole_depth >= drillPhaseObj.phaseStart);
    return index > 0 ? index : 0;
  }, [data, drillPhaseObj.phaseStart]);
  const holeDepthRightIndex = useMemo(() => {
    const index = data.findIndex(d => d.hole_depth >= drillPhaseObj.phaseEnd) - 1;
    return index > 0 ? index : data.length - 1;
  }, [data, drillPhaseObj.phaseEnd]);

  const stepFactor = step / maxStep;
  const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
  const leftBoundIndexMoving = Math.abs(view.x / view.xScale);

  const rightBoundIndex = calcBounds(visibleDataLength + leftBoundIndexMoving, data.length);
  const stepIndex = calcBounds(stepFactor * visibleDataLength + leftBoundIndexMoving, data.length);
  const dataMin = useMemo(() => min(data, d => d.rop_a), [data]);
  const barHeight = useMemo(() => max(data, d => d.rop_a) - dataMin, [dataMin, data]);

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
    if (holeDepthLeftIndex >= 0 && holeDepthRightIndex > 0) {
      const isLastIndex = data.length - 1 <= holeDepthRightIndex;
      const beginningDate = _.get(data, `[${holeDepthLeftIndex}].Date_Time`, "");
      const endDate = !isLastIndex ? _.get(data, `[${holeDepthRightIndex}].Date_Time`, "") : "NOW";
      const indexDiff = holeDepthRightIndex - holeDepthLeftIndex + 1;

      updateView(view => {
        const xScale = computeInitialViewXScaleValue(indexDiff)(width - GRID_GUTTER);
        return {
          x: -1 * holeDepthLeftIndex * xScale,
          y: 62,
          xScale,
          yScale: height ? getInitialViewYScaleValue(dataMin - 50) : view.yScale
        };
      });

      setGlobalDates([beginningDate, endDate]);

      setSliderInterval({
        firstDepth: _.get(data, `[${Math.floor(holeDepthLeftIndex)}].hole_depth`),
        lastDepth: _.get(data, `[${Math.round(holeDepthRightIndex)}].hole_depth`),
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
    async function startTimeSliderFetch() {
      const maxDepth = hasProjections ? maxProjectionDepth : maxSurveyDepth;
      for (let i = minSurveyDepth; i <= maxDepth; i += 100) {
        const index = i > maxDepth ? maxDepth : i;
        console.log(minSurveyDepth, maxDepth, hasSurveys, surveys);
        await getTimeSliderData(wellId, index, index + 100);
      }
    }

    if (hasSurveys && !hasFetchedTimeSliderData.current) {
      startTimeSliderFetch();
      hasFetchedTimeSliderData.current = true;
    }
  }, [hasSurveys, hasProjections, getTimeSliderData, maxSurveyDepth, maxProjectionDepth, minSurveyDepth, wellId]);

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
    if (data && data.length && step >= 0 && maxStep > 0 && leftBoundIndexMoving >= 0 && rightBoundIndex > 0) {
      const isLastDataIndex = data.length - 1 <= Math.round(rightBoundIndex);
      const beginningDateMoving = _.get(data, `[${Math.floor(leftBoundIndexMoving)}].Date_Time`, "");
      const endDateMoving = !isLastDataIndex ? _.get(data, `[${Math.round(rightBoundIndex)}].Date_Time`, "") : "NOW";

      setSliderInterval({
        firstDepth: _.get(data, `[${Math.round(leftBoundIndexMoving)}].hole_depth`),
        lastDepth: _.get(data, `[${Math.round(stepIndex)}].hole_depth`, data[data.length - 1].hole_depth),
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

  useEffect(() => {
    if (!drillPhaseObj.set) {
      for (let i = 0; i < wellSections.length; i++) {
        const { phaseStart, phaseEnd } = wellSections[i];
        if (sliderInterval.firstDepth >= phaseStart && sliderInterval.lastDepth <= phaseEnd) {
          if (wellSections[i].phase !== ALL || maxStep >= data.length - 1) {
            setDrillPhase({ type: "SET", payload: { ...wellSections[i], inView: true } });
            break;
          } else {
            setDrillPhase({ type: "UPDATE_VIEW", payload: false });
          }
        }
      }
    }
  }, [
    setDrillPhase,
    sliderInterval.firstDepth,
    sliderInterval.lastDepth,
    wellSections,
    drillPhaseObj.phase,
    drillPhaseObj.set,
    data.length,
    maxStep
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
