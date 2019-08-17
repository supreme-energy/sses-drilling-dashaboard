import React, { useReducer, useMemo, useState, useEffect } from "react";

import { scaleLinear } from "d3-scale";
import { max, min } from "d3-array";
import { useAdditionalDataLog, useAdditionalDataLogsList } from "../../../../api";
import WidgetCard from "../../../../components/WidgetCard";
import classes from "./styles.scss";
import { useWellIdContainer } from "../../../App/Containers";
import { graphReducer } from "./reducers";
import classNames from "classnames";

import Box from "@material-ui/core/Box";
import useRef from "react-powertools/hooks/useRef";
import { useSize } from "react-hook-size";
import PixiLine from "../../../../components/PixiLine";
import PixiContainer from "../../../../components/PixiContainer";
import useViewport from "../../../../hooks/useViewport";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import Grid from "../../../../components/Grid";

function computeInitialViewXScaleValue(data) {
  const diff = max(data, d => d.value) - min(data, d => d.value);
  return scaleLinear()
    .domain([0, diff])
    .range([0, 1]);
}

const mapValue = d => [Number(d.value), Number(d.md)];
const gridGutter = 40;

function GraphComponent({ wellId, logId, isFirstGraph }) {
  const {
    data: { label, color, data = [] }
  } = useAdditionalDataLog(wellId, logId);

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data) : () => 1),
    [data]
  );

  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 0.6
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

  // set initial scale
  useEffect(
    function setInitialScale() {
      if (data && data.length && width) {
        const minDepth = Math.min(...data.map(d => d.md));
        const minValue = Math.min(...data.map(d => d.value));

        updateView(view => {
          const xScale = getInitialViewXScaleValue(width - 50);
          return {
            ...view,
            x: -minValue * xScale + 50,
            y: -minDepth * view.yScale + 30,
            xScale: xScale
          };
        });
      }
    },
    [data, width, getInitialViewXScaleValue]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, data, view, width, height]
  );

  return (
    <div className={classNames(classes.wellHoleGraphContainer)}>
      <span>{label}</span>
      <div className={classes.wellHolePlot} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />
        <PixiLine container={viewport} data={data} mapData={mapValue} color={Number(`0x${color}`)} />
        <Grid
          container={viewport}
          view={view}
          width={width}
          height={height}
          gridGutter={gridGutter}
          showYAxis={isFirstGraph}
        />
      </div>
    </div>
  );
}

export function WellBottomHoleInfo() {
  const { wellId } = useWellIdContainer();
  const [selectedGraphs, setSelectedGraphs] = useReducer(graphReducer, []);
  const { data = [], dataBySection = {} } = useAdditionalDataLogsList(wellId);

  const availableGraphs = useMemo(() => {
    return data.filter(l => l.data_count > 0).map(l => l.label);
  }, [data]);

  return (
    <WidgetCard
      className={classes.wellHoleInfoContainer}
      title="Well and Bottom Hole Assembly Information"
      selectedMenuItems={selectedGraphs}
      setSelectedMenuItem={setSelectedGraphs}
      menuItemEnum={availableGraphs}
    >
      <Box
        className={classes.graphRowContainer}
        display="flex"
        flexDirection="row"
        flex="1"
        justifyContent="space-evenly"
      >
        {selectedGraphs.map((graph, i) => {
          const logId = dataBySection[graph].id;
          const isFirstGraph = i === 0;
          return <GraphComponent key={logId} wellId={wellId} logId={logId} isFirstGraph={isFirstGraph} />;
        })}
      </Box>
    </WidgetCard>
  );
}

WellBottomHoleInfo.propTypes = {};

export default WellBottomHoleInfo;
