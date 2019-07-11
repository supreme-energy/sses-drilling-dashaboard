import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Typography } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { useSize } from "react-hook-size";

import { useWellOperationHours } from "../../../../api";
import PixiContainer from "../../../../components/PixiContainer";
import PixiRectangle from "../../../../components/PixiRectangle";
import PixiText from "../../../../components/PixiText";
import useViewport from "../../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import WidgetCard from "../../../WidgetCard";
import classes from "./WellOperation.scss";

const gridGutter = 10;
const barWidth = 10;
const spacingFactor = 1.3;
const textAnchor = [0, 1];

function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, max(data, d => d.value)])
      .range([0, 1]);
  }
}

function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, data.length * barWidth * spacingFactor])
      .range([0, 1]);
  }
}

function WellOperation({ wellId }) {
  const data = useWellOperationHours(wellId);
  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });
  const maxValue = useMemo(() => max(data, d => d.value), [data]);

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
    zoomYScale: false
  });

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: gridGutter + 1,
      y: gridGutter + 70,
      yScale: getInitialViewYScaleValue(height - gridGutter - 30) * -1,
      xScale: getInitialViewXScaleValue(width - gridGutter)
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
    [refresh, stage, data, view, width, height]
  );

  return (
    <WidgetCard className={classes.wellOperation} hideMenu>
      <Typography variant="subtitle1">Hours of Well Operation</Typography>
      <div className={classes.wellOperationCanvas} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        {data.map((d, index) => {
          const xValue = spacingFactor * index * barWidth;
          return (
            <React.Fragment key={d.type}>
              <PixiRectangle
                updateTransform={null}
                container={viewport}
                width={barWidth}
                height={maxValue}
                x={xValue}
                backgroundColor={0xf9f8f2}
              />
              <PixiRectangle
                updateTransform={null}
                container={viewport}
                width={barWidth}
                height={d.value}
                x={xValue}
                backgroundColor={0xd4d1af}
              />
              <PixiText
                ref={textRef}
                anchor={textAnchor}
                container={viewport}
                x={xValue + 3.5}
                text={d.value}
                color={0x000000}
                fontSize={12}
              />
              <PixiText
                ref={textRef}
                container={viewport}
                x={xValue}
                text={d.type}
                color={0x000000}
                fontSize={11}
                align="center"
                wrapWidth={42}
                breakWords
                wrap
              />
            </React.Fragment>
          );
        })}
      </div>
    </WidgetCard>
  );
}

export default WellOperation;
