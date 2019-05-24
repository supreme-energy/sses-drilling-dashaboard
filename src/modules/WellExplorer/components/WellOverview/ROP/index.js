import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useRopData } from "../../../../../api";
import useRef from "react-powertools/hooks/useRef";
import { useSize } from "react-hook-size";
import { scaleLinear } from "d3-scale";
import { max, group, pairs } from "d3-array";
import { SectionsGraph } from "./SectionsGraph";
import PixiLine from "./PixiLine";
import PixiContainer from "./PixiContainer";
import useViewport from "./useViewport";
import { useWebGLRenderer } from "./useWebGLRenderer";
import Grid from "./Grid";
import classNames from "classnames";
import classes from "./styles.scss";
import { colorBySection } from "../../../../../constants/pixiColors";
import { getHoursDif } from "../../../utils/time";
import SectionsBg from "./SectionsBg";
import { orderedSections } from "../../../../../constants/wellSections";
import XAxis from "./XAxis";
import { getScaledValue } from "../../../utils/scale";
import Legend from "./Legend";

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

const mapAverage = d => [Number(d.ROP_A), Number(d.Hole_Depth)];
const mapInstant = d => [Number(d.ROP_I), Number(d.Hole_Depth)];
const gridGutter = 50;

const getDataBySection = data => {
  return group(data, d => d.A_interval);
};

export default function Rop({ className, style }) {
  const data = useRopData();

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
    zoomYScale: true
  });

  const dataBySection = useMemo(() => getDataBySection(data), [data]);

  const onReset = useCallback(() => {
    updateView(view => ({
      ...view,
      x: gridGutter + 5,
      y: gridGutter + 10,
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
    [width, data, height, onReset]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, data, view, width, height]
  );

  const hoursScaleNoRange = useMemo(() => {
    const totalHours = data && data.length ? getHoursDif(data[0].Date_Time, data[data.length - 1].Date_Time) : 0;
    return scaleLinear().domain([0, totalHours]);
  }, [data]);

  const hoursScale = useMemo(() => {
    return hoursScaleNoRange.range([0, getScaledValue(view.xScale, width - gridGutter)]).copy();
  }, [view, hoursScaleNoRange, width]);

  const sectionsData = useMemo(() => {
    const sData = orderedSections
      .filter(key => dataBySection.get(key))
      .map(key => {
        const value = dataBySection.get(key);
        const p = mapInstant(value[0]);
        return {
          position: [hoursScale(getHoursDif(data[0].Date_Time, value[0].Date_Time)), p[1]],
          color: colorBySection[key],
          key
        };
      });

    // add last segment
    if (sData.length) {
      const p = mapInstant(data[data.length - 1]);

      sData.push({
        position: [hoursScale(getHoursDif(data[0].Date_Time, data[data.length - 1].Date_Time)), p[1]],
        color: sData[sData.length - 1].color,
        key: "end"
      });
    }
    return pairs(sData);
  }, [dataBySection, data, hoursScale]);

  // X axis is on stage that is not scaled so we need a different range
  const xAxisScale = useMemo(() => hoursScale.copy().range([0, width - gridGutter]), [hoursScale, width]);

  return (
    <div className={classNames(className, classes.container)} style={style}>
      <Legend className={classes.legend} />
      <div className={classes.plot} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        <PixiContainer
          container={viewport}
          child={container => (
            <SectionsBg
              view={view}
              sectionsData={sectionsData}
              hoursScale={hoursScale}
              container={container}
              width={getScaledValue(view.xScale, width - gridGutter)}
            />
          )}
        />

        <PixiLine container={viewport} data={data} mapData={mapInstant} color={0xffffff} />
        <PixiLine container={viewport} data={data} mapData={mapAverage} color={0xca221d} />
        <PixiContainer
          container={viewport}
          child={container => (
            <SectionsGraph
              view={view}
              data={data}
              sectionsData={sectionsData}
              hoursScale={hoursScale}
              container={container}
              dataBySection={dataBySection}
              mapData={mapInstant}
              width={width - gridGutter}
            />
          )}
        />

        <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} />
        <XAxis
          x={gridGutter}
          y={height - 30}
          height={30}
          gridGutter={gridGutter}
          view={view}
          scale={xAxisScale}
          container={stage}
        />
      </div>
    </div>
  );
}
