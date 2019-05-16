import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { useSize } from "react-hook-size";
import moment from "moment";

import useRef from "react-powertools/hooks/useRef";

import Grid from "../../../../../WellExplorer/components/WellOverview/ROP/Grid";
import PixiContainer from "../../../../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiRectangle from "../../../../../WellExplorer/components/WellOverview/ROP/PixiRectangle";
import PixiLine from "../../../../../WellExplorer/components/WellOverview/ROP/PixiLine";
import useViewport from "../../../../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../../../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { STEP_VALUE } from "../index";
import { LINE_GRAPHS, COLOR_BY_GRAPH } from "../../../../../../constants/timeSlider";
import classes from "../TimeSlider.scss";

export const gridGutter = 60;

const EMPTY_ARRAY = [];

export const getScaledValue = (scaleFactor, value) => (1 / scaleFactor) * value;

export const getHoursDif = (start, end) => {
  const startTime = moment(start);
  const endTime = moment(end);
  const duration = moment.duration(endTime.diff(startTime));
  return duration.asHours();
};

function useRopData() {
  const [ropData, updateRopData] = useState(EMPTY_ARRAY);
  const loadData = async () => {
    const response = await fetch("/data/rop.json");

    const data = await response.json();

    updateRopData(data.data);
  };
  useEffect(() => {
    loadData();
  }, []);
  return ropData;
}

function useSlideData() {
  const [slideData, updateSlideData] = useState(EMPTY_ARRAY);
  const loadData = async () => {
    const response = await fetch("/data/slider.json");

    const data = await response.json();

    updateSlideData(data.data);
  };
  useEffect(() => {
    loadData();
  }, []);
  return slideData;
}

function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, data[data.length - 1].Hole_Depth])
      .range([0, 1]);
  }
}

function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, max(data, d => Math.max(d.ROP_A, d.ROP_I))])
      .range([0, 1]);
  }
}

const mapRop = d => [Number(d.Hole_Depth), Number(d.ROP_A)];
const mapSlide = d => [Number(d.Hole_Depth), Number(d.ROP_I)];

function TimeSlider({ expanded, zoom, step, setSliderStep, selectedGraphs }) {
  const data = useRopData();
  const slideData = useSlideData();

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
    x: gridGutter,
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
    zoom
  });

  const onReset = useCallback(() => {
    // console.log(
    //   getInitialViewYScaleValue((height - gridGutter) * 200),
    //   getInitialViewXScaleValue((width - gridGutter) / 21)
    // );
    updateView(view => ({
      ...view,
      x: 0,
      y: 0,
      yScale: getInitialViewYScaleValue((height - gridGutter) * 200),
      xScale: getInitialViewXScaleValue((width - gridGutter) / 21)
    }));
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height]);

  useEffect(
    function resetZoom() {
      if (!zoom[1]) onReset();
    },
    [onReset, zoom]
  );

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

  const handleDragSlider = useCallback((_, currentStep) => {
    setSliderStep([currentStep, 1]);
  });

  return (
    <div className={classes.timeSliderComponent}>
      {expanded && (
        <div className={classes.timeSliderGraph} ref={canvasRef}>
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
                      color={COLOR_BY_GRAPH[graph]}
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
                    slideData.map((data, barIndex) => {
                      if (barIndex % 131 === 0) {
                        return (
                          <PixiRectangle
                            key={barIndex}
                            container={container}
                            x={100 * barIndex + 100}
                            y={0}
                            width={50}
                            height={9000}
                            backgroundColor={COLOR_BY_GRAPH[graph]}
                          />
                        );
                      }
                    })
                  }
                />
              );
            }
          })}
          <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} hideGrid />
        </div>
      )}
      <Slider
        className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
        value={step}
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
  selectedGraphs: PropTypes.arrayOf(PropTypes.string)
};

export default TimeSlider;
