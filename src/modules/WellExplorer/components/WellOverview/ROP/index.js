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
import { colorBySection } from "../../../../../constants/colors";
import { getHoursDif } from "../../../utils/time";
import SectionsBg from "./SectionsBg";
import { orderedSections } from "../../../../../constants/wellSections";

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

  const viewport = useViewport({
    renderer,
    stage,
    width,
    height,
    view,
    updateView,
    refresh,
    zoomXScale: false,
    zoomYScale: true
  });

  const dataBySection = useMemo(() => getDataBySection(data), [data]);

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

  const hoursScale = useMemo(() => {
    if (data && data.length) {
      const hours = getHoursDif(data[0].Date_Time, data[data.length - 1].Date_Time);

      return scaleLinear()
        .domain([0, hours])
        .range([0, width]);
    }
    return () => 0;
  }, [data, width]);

  const sectionsData = useMemo(() => {
    const lData = orderedSections
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

    if (lData.length) {
      const p = mapInstant(data[data.length - 1]);

      lData.push({
        position: [hoursScale(getHoursDif(data[0].Date_Time, data[data.length - 1].Date_Time)), p[1]],
        color: lData[lData.length - 1].color,
        key: "end"
      });
    }
    return pairs(lData);
  }, [dataBySection, data, hoursScale]);

  return (
    <div className={classNames(className, classes.plot)} style={style} ref={canvasRef}>
      <PixiContainer container={viewport}>
        {container =>
          [...dataBySection].map(([key, value]) => (
            <PixiLine container={container} key={key} data={value} mapData={mapInstant} color={colorBySection[key]} />
          ))
        }
      </PixiContainer>
      <PixiLine container={viewport} data={data} mapData={mapAverage} color={0xca221d} />
      <Grid container={viewport} width={width} height={height} gridGutter={gridGutter} ref={gridRef} />
      <SectionsBg
        view={view}
        sectionsData={sectionsData}
        hoursScale={hoursScale}
        container={viewport}
        width={width - gridGutter}
      />
      <SectionsGraph
        view={view}
        data={data}
        sectionsData={sectionsData}
        hoursScale={hoursScale}
        container={viewport}
        dataBySection={dataBySection}
        mapData={mapInstant}
        width={width - gridGutter}
      />
    </div>
  );
}
