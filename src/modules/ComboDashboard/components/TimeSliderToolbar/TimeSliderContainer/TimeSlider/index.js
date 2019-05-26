import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import { useSize } from "react-hook-size";
import get from "lodash/get";
import classNames from "classnames";

import useRef from "react-powertools/hooks/useRef";

import PixiContainer from "../../../../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiRectangle from "../../../../../WellExplorer/components/WellOverview/ROP/PixiRectangle";
import PixiText from "../../../../../WellExplorer/components/WellOverview/ROP/PixiText";
import PixiLine from "../../../../../WellExplorer/components/WellOverview/ROP/PixiLine";
import useViewport from "../../../../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../../../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import {
  STEP_SIZE,
  LINE_GRAPHS,
  COLOR_BY_GRAPH,
  PLANNED_ANGLE,
  GRID_GUTTER
} from "../../../../../../constants/timeSlider";
import { computeInitialViewXScaleValue, computeInitialViewYScaleValue, mapRop, mapSlide } from "./TimeSliderUtil";
import classes from "../TimeSlider.scss";

function TimeSlider({
  expanded,
  zoom,
  step,
  setSliderStep,
  selectedGraphs,
  setGlobalDates,
  data,
  maxStep,
  setMaxStep
}) {
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

  const [view, updateView] = useState({
    x: GRID_GUTTER,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const scaleInitialized = useRef(false);
  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: false,
    zoomYScale: true,
    step,
    maxStep,
    zoom,
    dataSize: data.length
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
    [refresh, stage, data, view, width, height, selectedGraphs]
  );

  useEffect(
    function resetZoom() {
      if (!zoom[1]) onReset();
    },
    [onReset, zoom]
  );

  useEffect(
    function resetOnExpand() {
      if (expanded) onReset();
    },
    [expanded, onReset]
  );

  useEffect(() => {
    setMaxStep(data.length);
  }, [data, setMaxStep]);

  useEffect(() => {
    setSliderStep(step => [data.length, step[1]]);
  }, [data, setSliderStep]);

  useEffect(() => {
    if (expanded) {
      setMaxStep(prevMaxStep => {
        const newMaxStep = (width - GRID_GUTTER) / view.xScale;
        setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
        return newMaxStep;
      });
    }
  }, [setMaxStep, setSliderStep, width, expanded, view.xScale]);

  useEffect(() => {
    const stepFactor = step / maxStep;
    const hiddenDataLength = Math.abs(view.x) / view.xScale;
    const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
    const endDataIndex = stepFactor ? stepFactor * visibleDataLength + hiddenDataLength - 1 : 0;

    const beginningDate = get(data, `[${hiddenDataLength}].Date_Time`, "");
    const endDate = get(data, `[${Math.ceil(endDataIndex)}].Date_Time`, "NOW");

    setGlobalDates([beginningDate, endDate]);
  }, [data, setGlobalDates, width, view, step, maxStep]);

  useEffect(() => {
    if (zoom && zoom[1] !== 0) {
      const factor = 1 + zoom[1] * 0.03;

      // Calc new view, bound graph to sides of canvas when zooming
      updateView(prev => {
        const stepFactor = ((step * (width + GRID_GUTTER)) / maxStep).toFixed(2);
        const graphHiddenLength = Math.abs(prev.x) / prev.xScale;
        const graphTotalLength = data.length;
        const graphVisibleLength = (graphTotalLength - graphHiddenLength) * prev.xScale;

        // Graph should either take up entire view, or be larger than view
        const isTotalOverflow = graphTotalLength * prev.xScale * factor >= Math.floor(width - GRID_GUTTER);
        const isVisibleOverflow = graphVisibleLength >= width - GRID_GUTTER;

        let newX = stepFactor - (stepFactor - prev.x) * factor;
        let newScale = prev.xScale * factor;

        if (!isVisibleOverflow && zoom[1] > 0) {
          newX = newX + (width - graphVisibleLength - GRID_GUTTER);
        } else if (!isTotalOverflow && !isVisibleOverflow && zoom[1] < 0) {
          newX = 0;
          newScale = getInitialViewXScaleValue(width - GRID_GUTTER);
        }

        return {
          ...prev,
          x: newX <= 0 ? newX : prev.x,
          xScale: newScale
        };
      });
    }
  }, [zoom, updateView, width, data, getInitialViewXScaleValue]);

  const handleDragSlider = useCallback(
    (_, currentStep) => {
      setSliderStep([currentStep, 1]);
    },
    [setSliderStep]
  );

  return (
    <div className={classes.timeSliderComponent}>
      <div
        className={classNames(classes.timeSliderGraph, !expanded && classes.timeSliderGraphCollapsed)}
        ref={canvasRef}
      >
        <PixiContainer ref={viewportContainer} container={stage} />
        {selectedGraphs.map((graph, index) => {
          if (LINE_GRAPHS.includes(graph)) {
            return (
              <PixiContainer
                key={index}
                container={viewport}
                child={container => (
                  <PixiLine
                    container={container}
                    data={data}
                    mapData={graph === "ROP" ? mapRop : mapSlide}
                    color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                  />
                )}
              />
            );
          } else {
            // TODO Implement based on real data
            return (
              <PixiContainer
                key={index}
                container={viewport}
                child={container =>
                  data.map((data, barIndex) => {
                    if (barIndex % 131 === 0) {
                      return (
                        <PixiRectangle
                          key={barIndex}
                          container={container}
                          x={100 * barIndex + 100}
                          y={0}
                          width={50}
                          height={9000}
                          backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                        />
                      );
                    }
                  })
                }
              />
            );
          }
        })}
      </div>
      <Slider
        className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
        value={step}
        max={maxStep}
        onChange={handleDragSlider}
        step={STEP_SIZE}
      />
    </div>
  );
}

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  step: PropTypes.number,
  zoom: PropTypes.arrayOf(PropTypes.number),
  setSliderStep: PropTypes.func,
  selectedGraphs: PropTypes.arrayOf(PropTypes.string),
  setGlobalDates: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.object),
  maxStep: PropTypes.number,
  setMaxStep: PropTypes.func
};

export default TimeSlider;
