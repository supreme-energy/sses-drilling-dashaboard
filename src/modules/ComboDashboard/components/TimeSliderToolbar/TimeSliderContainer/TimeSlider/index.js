import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import { scaleLinear } from "d3-scale";
import { max, group, pairs } from "d3-array";
import { useSize } from "react-hook-size";
import moment from "moment";

import useRef from "react-powertools/hooks/useRef";

import Grid from "./Grid";
import PixiContainer from "./PixiContainer";
import PixiRectangle from "./PixiRectangle";
import PixiLine from "./PixiLine";
import useViewport from "./useViewport";
import { useWebGLRenderer } from "./useWebGLRenderer";
import { STEP_VALUE } from "../index";
import classes from "../TimeSlider.scss";

export const gridGutter = 60;

const EMPTY_ARRAY = [];
export const colorByGraph = {
  ROP: 0x08bb00,
  SLIDE: 0xa9fffb,
  CONNECTION: 0xd9aafe,
  LENGTH: 0x967f2f
};

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
  const connectionData = useSlideData();

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
    zoom,
    step
  });

  const onReset = useCallback(() => {
    //  0.07, -0.2;
    console.log(
      getInitialViewXScaleValue((width - gridGutter) / 15),
      getInitialViewYScaleValue(height - gridGutter - 500)
    );
    updateView(view => ({
      ...view,
      x: 0,
      y: 30,
      yScale: getInitialViewYScaleValue((height - gridGutter) * 30),
      xScale: getInitialViewXScaleValue((width - gridGutter) / 20)
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
    [refresh, stage, data, view, width, height]
  );

  const handleDragSlider = useCallback((_, currentStep) => {
    setSliderStep([currentStep, 1]);
  });

  return (
    <div className={classes.timeSliderComponent}>
      {expanded && (
        <div className={classes.timeSliderGraph} ref={canvasRef}>
          <PixiContainer ref={viewportContainer} container={stage} />
          <PixiContainer container={viewport}>
            {container =>
              selectedGraphs.map((graph, index) => (
                <PixiLine key={index} container={container} data={data} mapData={mapRop} color={colorByGraph[graph]} />
              ))
            }
          </PixiContainer>
          <PixiContainer container={viewport}>
            {container =>
              slideData.map((graph, index) => {
                if (index % 31 === 0) {
                  return (
                    <PixiRectangle
                      key={index}
                      container={viewport}
                      x={110 * index + 50}
                      y={0}
                      width={(1000 * index) / 100}
                      height={800}
                      backgroundColor={colorByGraph["SLIDE"]}
                    />
                  );
                }
              })
            }
          </PixiContainer>
          <PixiContainer container={viewport}>
            {container =>
              connectionData.map((graph, index) => {
                if (index % 31 === 0) {
                  return (
                    <PixiRectangle
                      key={index}
                      container={viewport}
                      x={100 * index + 100}
                      y={0}
                      width={50}
                      height={800}
                      backgroundColor={colorByGraph["CONNECTION"]}
                    />
                  );
                }
              })
            }
          </PixiContainer>
          <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} />
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
