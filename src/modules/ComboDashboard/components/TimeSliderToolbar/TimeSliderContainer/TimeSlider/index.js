import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import { scaleLinear } from "d3-scale";
import { max, group, pairs } from "d3-array";

import useRef from "react-powertools/hooks/useRef";

import Grid from "./Grid";
import PixiContainer from "./PixiContainer";
import PixiLine from "./PixiLine";
import useViewport from "./useViewport";
import useWebGLRenderer from "./WebglRenderer";
import { STEP_VALUE } from "../index";
import classes from "../TimeSlider.scss";

const width = window.innerWidth - 300;
const height = 200;
const gridGutter = 50;

const EMPTY_ARRAY = [];
export const colorBySection = {
  ROP: 0x08bb00,
  SLIDE: 0xa9fffb,
  CONNECTION: 0xd9aafe,
  LENGTH: 0x967f2f
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
  // const { width, height } = useSize(canvasRef);
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
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const scaleInitialized = useRef(false);

  const viewport = useViewport({
    renderer,
    stage,
    width,
    height,
    view,
    updateView,
    refresh,
    zoomXScale: true,
    zoomYScale: true,
    zoom,
    step
  });

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: gridGutter + 10,
      y: 10,
      yScale: getInitialViewYScaleValue(height - gridGutter - 50),
      xScale: getInitialViewXScaleValue(width - gridGutter - 20)
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
    [width, data, view, getInitialViewXScaleValue, getInitialViewYScaleValue, height, onReset]
  );

  const gridRef = useRef(null);

  useEffect(() => {
    gridRef.current.updateGrid(view);
    refresh();
  }, [refresh, stage, data, view, width, height]);

  const handleDragSlider = useCallback((_, currentStep) => {
    setSliderStep(currentStep);
  });

  return (
    <div className={classes.timeSliderComponent}>
      {expanded && (
        <div className={classes.timeSliderGraph} ref={canvasRef}>
          <PixiContainer container={viewport}>
            {container =>
              selectedGraphs.map((value, key) => (
                <PixiLine container={container} key={key} data={data} mapData={mapRop} color={colorBySection[value]} />
              ))
            }
          </PixiContainer>
          <Grid container={viewport} width={width} height={height} ref={gridRef} />
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
  zoom: PropTypes.array,
  setSliderStep: PropTypes.func,
  selectedGraphs: PropTypes.arrayOf(PropTypes.string)
};

export default TimeSlider;
