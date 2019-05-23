import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import { useSize } from "react-hook-size";
import get from "lodash/get";

import useRef from "react-powertools/hooks/useRef";

import Grid from "../../../../../WellExplorer/components/WellOverview/ROP/Grid";
import PixiContainer from "../../../../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiRectangle from "../../../../../WellExplorer/components/WellOverview/ROP/PixiRectangle";
import PixiText from "../../../../../WellExplorer/components/WellOverview/ROP/PixiText";
import PixiLine from "../../../../../WellExplorer/components/WellOverview/ROP/PixiLine";
import useViewport from "../../../../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../../../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { STEP_VALUE, LINE_GRAPHS, COLOR_BY_GRAPH, PLANNED_ANGLE } from "../../../../../../constants/timeSlider";
import {
  GRID_GUTTER,
  computeInitialViewXScaleValue,
  computeInitialViewYScaleValue,
  mapRop,
  mapSlide
} from "./TimeSliderUtil";
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
    expanded
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
  }, [data]);

  useEffect(() => {
    setSliderStep(step => [data.length, step[1]]);
  }, [data, setSliderStep]);

  useEffect(() => {
    setMaxStep(prevMaxStep => {
      const newMaxStep = (width - GRID_GUTTER) / view.xScale - 1;
      setSliderStep(prevStep => [(newMaxStep * prevStep[0]) / prevMaxStep, prevStep[1]]);
      return newMaxStep;
    });
  }, [view, setMaxStep, setSliderStep, width]);

  useEffect(() => {
    const stepFactor = step / maxStep;
    const hiddenDataLength = Math.ceil(Math.abs(view.x) / view.xScale);
    const visibleDataLength = (width - GRID_GUTTER) / view.xScale;
    const endDataIndex = stepFactor ? stepFactor * visibleDataLength + hiddenDataLength - 1 : 0;

    const beginningDate = get(data, `[${hiddenDataLength}].Date_Time`, "");
    const endDate = get(data, `[${Math.ceil(endDataIndex)}].Date_Time`, "NOW");

    setGlobalDates([beginningDate, endDate]);
  }, [zoom, data, setGlobalDates, width, view, step, maxStep]);

  const handleDragSlider = useCallback(
    (_, currentStep) => {
      setSliderStep([currentStep, 1]);
    },
    [setSliderStep]
  );

  return (
    <div className={classes.timeSliderComponent}>
      <div className={classes.timeSliderGraph} style={{ display: expanded ? "" : "none" }} ref={canvasRef}>
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
            return (
              <PixiContainer
                key={index}
                container={viewport}
                child={container =>
                  data.map((data, barIndex) => {
                    if (barIndex % 131 === 0) {
                      if (graph === PLANNED_ANGLE) {
                        return (
                          <React.Fragment key={barIndex}>
                            <PixiRectangle
                              container={container}
                              x={200}
                              y={0}
                              width={50}
                              height={150}
                              backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[PLANNED_ANGLE])}
                            />
                            <PixiRectangle
                              container={container}
                              x={200}
                              y={200}
                              width={50}
                              height={150}
                              backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[PLANNED_ANGLE])}
                            />
                            <PixiRectangle
                              container={container}
                              x={200}
                              y={400}
                              width={50}
                              height={150}
                              backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[PLANNED_ANGLE])}
                            />
                            <PixiRectangle
                              container={container}
                              x={200}
                              y={600}
                              width={50}
                              height={150}
                              backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[PLANNED_ANGLE])}
                            />
                            <PixiText container={container} text="90" fontSize="40" color={0xbfbfbf} />
                          </React.Fragment>
                        );
                      } else {
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
                    }
                  })
                }
              />
            );
          }
        })}
        <Grid container={viewport} view={view} width={width} height={height} gridGutter={GRID_GUTTER} hideGrid />
      </div>
      <Slider
        className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
        value={step}
        max={maxStep}
        onChange={handleDragSlider}
        step={STEP_VALUE}
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
  maxStep: PropTypes.string,
  setMaxStep: PropTypes.func
};

export default TimeSlider;
