import React, { useState, useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import { useSize } from "react-hook-size";

import PixiContainer from "../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiBar from "./PixiBar";
import PixiLine from "../../WellExplorer/components/WellOverview/ROP/PixiLine";
import { useTimeSliderContainer, useLastIndexStateContainer, useDrillPhaseContainer } from "../../App/Containers";
import VerticalMenu from "../../VerticalMenu";
import Legend from "./Legend";
import Slider from "./Slider";
import ZoomControls from "./ZoomControls";
import { GlobalStartTimeControl, GlobalEndTimeControl } from "./GlobalTimeControls";
import LocalTimeControls from "./LocalTimeControls";
import { graphReducer } from "./reducers";
import useViewport from "../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { useTimeSliderData } from "../../../api";
import { SURFACE } from "../../../constants/wellSections";
import {
  COLOR_BY_GRAPH,
  COLOR_BY_PHASE_VIEWER,
  GRID_GUTTER,
  MAP_BY_GRAPH,
  LINE_CHARTS
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
  const { setSliderInterval } = useTimeSliderContainer();
  const { setLastIndexState } = useLastIndexStateContainer();
  const { setDrillPhase, drillPhaseObj } = useDrillPhaseContainer();

  // Create local state
  const [maxSliderStep, setMaxSliderStep] = useState(0);
  const [sliderStep, setSliderStep] = useState([0, 0]);
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

  // Determine if graph has been moved off screen by drag
  const isGraphWithinBounds = useCallback(
    (xScale, newX) => {
      return (
        data.length * xScale - Math.abs(newX) > width - GRID_GUTTER &&
        Math.round(sliderStep[0]) <= Math.round(maxSliderStep) &&
        newX / xScale < 0
      );
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
    const firstIndex = data.map(e => e.Hole_Depth).indexOf(drillPhaseObj.phaseStart);
    const lastIndex = data.map(e => e.Hole_Depth).lastIndexOf(drillPhaseObj.phaseEnd);
    const indexDiff = lastIndex - firstIndex;

    if (firstIndex > 0 && lastIndex > 0) {
      const isLastDataIndex = data.length - 1 <= lastIndex;
      const beginningDate = _.get(data, `[${firstIndex}].Date_Time`, "");
      const endDate = !isLastDataIndex ? _.get(data, `[${lastIndex}].Date_Time`, "") : "NOW";

      updateView(view => {
        const w = width || maxSliderStep * view.xScale + GRID_GUTTER;
        const xScale = computePhaseXScaleValue(indexDiff)(w - GRID_GUTTER);
        return {
          x: -1 * firstIndex * xScale,
          xScale,
          y: 0,
          yScale: height ? getInitialViewYScaleValue(height) : view.yScale
        };
      });

      setSliderInterval([
        _.get(data, `[${Math.floor(firstIndex)}].Hole_Depth`),
        _.get(data, `[${Math.round(lastIndex)}].Hole_Depth`)
      ]);

      setLastIndexState(isLastDataIndex);
      setMaxSliderStep(indexDiff);
      setSliderStep([indexDiff, 1]);
      setGlobalDates([beginningDate, endDate]);
    }
  }, [
    data,
    drillPhaseObj,
    getInitialViewYScaleValue,
    width,
    height,
    maxSliderStep,
    setSliderInterval,
    setLastIndexState
  ]);

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
  useEffect(() => {
    if (
      data &&
      data.length &&
      ((width && height) || !expanded) &&
      (!scaleInitialized.current || (!_.isEqual(drillPhaseObj, prevPhase) && drillPhaseObj.inView))
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
    if (expanded && view.xScale) {
      setMaxSliderStep(prevMaxStep => {
        const newMaxStep = (prevMaxStep * view.xScale) / view.xScale;
        setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
        return newMaxStep;
      });
    }
  }, [expanded, view.xScale]);

  useEffect(() => {
    if (data && data.length && view.xScale) {
      const hiddenDataLength = Math.abs(view.x / view.xScale);
      const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
      const endDataIndex = visibleDataLength - 1 + hiddenDataLength;

      setDrillPhase(drillPhase => {
        const firstIndex = data.map(e => e.Hole_Depth).indexOf(drillPhase.phaseStart);
        const lastIndex = data.map(e => e.Hole_Depth).lastIndexOf(drillPhase.phaseEnd);

        if ((firstIndex > Math.round(hiddenDataLength) || lastIndex < endDataIndex) && drillPhase.inView) {
          return {
            ...drillPhase,
            inView: false
          };
        } else if (firstIndex <= Math.round(hiddenDataLength) && lastIndex >= endDataIndex && !drillPhase.inView) {
          return {
            ...drillPhase,
            inView: true
          };
        } else {
          return drillPhase;
        }
      });
    }
  }, [data, width, view, setDrillPhase]);

  useEffect(() => {
    if (data && data.length && sliderStep[0] >= 0 && maxSliderStep > 0) {
      const stepFactor = sliderStep[0] / maxSliderStep;
      const firstIndex = Math.abs(view.x) / view.xScale;
      const visibleDataIndex = firstIndex + sliderStep[0];
      const visibleDataLength = (width - GRID_GUTTER) / view.xScale;

      const endDataIndex = stepFactor * visibleDataLength + firstIndex + GRID_GUTTER;

      if (firstIndex >= 0 && endDataIndex > 0) {
        const isLastDataIndex = data.length - 1 <= Math.round(endDataIndex);
        const beginningDate = _.get(data, `[${Math.floor(firstIndex)}].Date_Time`, "");
        const endDate = !isLastDataIndex ? _.get(data, `[${Math.round(endDataIndex)}].Date_Time`, "") : "NOW";

        setSliderInterval([
          _.get(data, `[${Math.floor(firstIndex)}].Hole_Depth`),
          _.get(data, `[${Math.round(visibleDataIndex)}].Hole_Depth`)
        ]);

        setLastIndexState(isLastDataIndex);
        setGlobalDates([beginningDate, endDate]);
      }
    }
  }, [data, view, width, sliderStep, maxSliderStep, setSliderInterval, setLastIndexState]);

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
              step={sliderStep[0]}
              maxSliderStep={maxSliderStep}
              dataSize={data.length}
              getInitialViewXScaleValue={getInitialViewXScaleValue}
              onReset={onReset}
              width={width}
            />
            <LocalTimeControls setSliderStep={setSliderStep} maxSliderStep={maxSliderStep} />
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
});

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  wellId: PropTypes.string
};

export default TimeSlider;
