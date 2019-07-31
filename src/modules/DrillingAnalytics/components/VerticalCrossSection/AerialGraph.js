import React, { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";

import useRef from "react-powertools/hooks/useRef";

import { COLOR_BY_GRAPH, ACTUAL, PLAN, TARGET_BOUNDARY } from "../../../../constants/drillingAnalytics";
import PixiLine from "../../../../components/PixiLine";
import PixiContainer from "../../../../components/PixiContainer";
import useViewport from "../../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import Grid from "../../../../components/Grid";
import Legend from "../Legend";
import classes from "../DrillingAnalytics.scss";

function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, data[data.length - 1].tvd])
      .range([0, 1]);
  }
}

function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, max(data, d => d.vs)])
      .range([0, 1]);
  }
}

const mapValues = d => [Number(d.vs), Number(d.tvd)];
const gridGutter = 50;

export function VerticalCrossSection({ selectedMenuItems, keys, wellPlanFiltered, surveys, formations }) {
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewYScaleValue = useMemo(
    () => (wellPlanFiltered && wellPlanFiltered.length ? computeInitialViewYScaleValue(wellPlanFiltered) : () => 1),
    [wellPlanFiltered]
  );

  const getInitialViewXScaleValue = useMemo(
    () => (wellPlanFiltered && wellPlanFiltered.length ? computeInitialViewXScaleValue(wellPlanFiltered) : () => 1),
    [wellPlanFiltered]
  );

  const [view, updateView] = useState({
    x: gridGutter,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: true,
    zoomYScale: true,
    isXScalingValid: () => 1
  });

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: gridGutter + 100,
      y: -150,
      yScale: getInitialViewYScaleValue(height - gridGutter - 150),
      xScale: getInitialViewXScaleValue(width - gridGutter - 150)
    }));
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (wellPlanFiltered && wellPlanFiltered.length && width && height) {
        onReset();
      }
    },
    [width, wellPlanFiltered, height, onReset]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, wellPlanFiltered, surveys, view, width, height, selectedMenuItems]
  );

  return (
    <React.Fragment>
      <Legend selectedGraphs={selectedMenuItems} keys={keys} />

      <div className={classes.depthGraphContainer} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        {wellPlanFiltered && wellPlanFiltered.length > 0 && selectedMenuItems.includes(PLAN) && (
          <PixiLine container={viewport} data={wellPlanFiltered} mapData={mapValues} color={COLOR_BY_GRAPH[PLAN].hex} />
        )}
        {surveys && surveys.length > 0 && selectedMenuItems.includes(ACTUAL) && (
          <PixiLine container={viewport} data={surveys} mapData={mapValues} color={COLOR_BY_GRAPH[ACTUAL].hex} />
        )}
        {selectedMenuItems.includes(TARGET_BOUNDARY) &&
          formations.map(f => {
            return (
              <PixiLine
                key={f.label}
                container={viewport}
                data={f.data}
                mapData={mapValues}
                color={COLOR_BY_GRAPH[TARGET_BOUNDARY].hex}
              />
            );
          })}
        <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} />
      </div>
    </React.Fragment>
  );
}

VerticalCrossSection.propTypes = {
  wellPlanFiltered: PropTypes.arrayOf(PropTypes.object),
  surveys: PropTypes.arrayOf(PropTypes.object),
  formations: PropTypes.arrayOf(PropTypes.object),
  keys: PropTypes.arrayOf(PropTypes.string),
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string)
};

export default VerticalCrossSection;
