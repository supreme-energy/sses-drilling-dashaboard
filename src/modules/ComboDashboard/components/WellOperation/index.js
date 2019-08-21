import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { useSize } from "react-hook-size";
import _ from "lodash";

import { useWellOperationHours } from "../../../../api";
import PixiContainer from "../../../../components/PixiContainer";
import PixiRectangle from "../../../../components/PixiRectangle";
import PixiText from "../../../../components/PixiText";
import useViewport from "../../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import WidgetCard from "../../../../components/WidgetCard";
import classes from "./WellOperation.scss";

const gridGutter = 10;
const barWidth = 10;
const spacingFactor = 1.3;
const textAnchor = [0.2, 1];

function computeInitialViewYScaleValue(rigStateValues) {
  if (rigStateValues && rigStateValues.length > 0) {
    return scaleLinear()
      .domain([0, max(rigStateValues)])
      .range([0, 1]);
  }
}

function computeInitialViewXScaleValue(rigStateValues) {
  if (rigStateValues && rigStateValues.length > 0) {
    return scaleLinear()
      .domain([0, rigStateValues.length * barWidth * spacingFactor])
      .range([0, 1]);
  }
}

function toTitleCase(text) {
  let string;

  string = text.toLowerCase();

  if (text.includes("_")) {
    let multiWord = string.split("_");
    for (var i = 0; i < multiWord.length; i++) {
      multiWord[i] = multiWord[i].charAt(0).toUpperCase() + multiWord[i].slice(1);
    }

    return multiWord.join(" ");
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

function WellOperation({ wellId }) {
  const data = useWellOperationHours(wellId);
  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });
  const rigState = _.get(data, "[0].rigstates", {});
  const rigStateArray = useMemo(() => _.map(rigState, (value, key) => ({ [key]: value })), [rigState]);
  const rigStateValues = useMemo(() => Object.values(rigState), [rigState]);
  const maxValue = useMemo(() => max(rigStateValues), [rigStateValues]);

  const getInitialViewYScaleValue = useMemo(
    () => (rigStateValues && rigStateValues.length ? computeInitialViewYScaleValue(rigStateValues) : () => 1),
    [rigStateValues]
  );

  const getInitialViewXScaleValue = useMemo(
    () => (rigStateValues && rigStateValues.length ? computeInitialViewXScaleValue(rigStateValues) : () => 1),
    [rigStateValues]
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
      if (data && data.length && width && height) {
        onReset();
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
    <WidgetCard className={classes.wellOperation} title="Hours of Well Operation" hideMenu>
      <div className={classes.wellOperationCanvas} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        {rigStateArray.map((obj, index) => {
          const key = Object.keys(obj)[0];
          const xValue = spacingFactor * index * barWidth;
          const title = toTitleCase(key);
          const space = title.length <= 6 ? 0.6 : 0;
          return (
            <React.Fragment key={key}>
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
                height={obj[key]}
                x={xValue}
                backgroundColor={0xd4d1af}
              />
              <PixiText
                ref={textRef}
                anchor={textAnchor}
                container={viewport}
                x={xValue + 3.5}
                text={obj[key]}
                color={0x000000}
                fontSize={12}
              />
              <PixiText
                ref={textRef}
                container={viewport}
                x={xValue + space}
                text={title}
                color={0x000000}
                fontSize={11}
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
