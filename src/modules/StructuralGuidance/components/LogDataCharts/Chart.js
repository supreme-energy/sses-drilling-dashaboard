import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import usePrevious from "react-use/lib/usePrevious";
import { max, min } from "d3-array";
import { scaleLinear } from "d3-scale";
import _ from "lodash";

import BiasAndScale from "../../../../components/BiasAndScale";
import { useFilteredAdditionalDataInterval } from "../../../App/Containers";
import classes from "./styles.scss";
import WebGlContainer from "../../../../components/WebGlContainer";
import PixiContainer from "../../../../components/PixiContainer";
import PixiLabel from "../../../../components/PixiLabel";
import { frozenXYTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiLine from "../../../../components/PixiLine";
import Grid from "../../../../components/Grid";
const gridGutter = 20;

function computeInitialViewXScaleValue(data, xAxis) {
  const diff = max(data, d => d[xAxis]) - min(data, d => d[xAxis]);
  return scaleLinear()
    .domain([0, diff])
    .range([0, 1]);
}

function Line({
  wellId,
  stage,
  canvasRef,
  logId,
  width,
  viewport,
  mapper,
  refresh,
  isEditing,
  showScale,
  scale,
  setScale,
  bias,
  view
}) {
  const { color, data = [] } = useFilteredAdditionalDataInterval(wellId, logId);

  const lineScale = { x: 1, y: scale || 1 };
  const alpha = isEditing && !showScale ? 0.1 : 1;
  const extent = [min(data, d => d.value) * view.yScale, max(data, d => d.value) * view.yScale];

  useEffect(
    function refreshWebGLRenderer() {
      if (data && data.length) {
        refresh();
      }
    },
    [refresh, data, showScale]
  );

  return (
    <React.Fragment>
      <PixiLine
        container={viewport}
        y={bias * scale}
        scale={lineScale}
        data={data}
        mapData={mapper}
        color={Number(`0x${color}`)}
        alpha={alpha}
      />
      {showScale && (
        <BiasAndScale
          container={stage}
          axis="y"
          x={width - 10}
          gridGutter={gridGutter}
          refresh={refresh}
          totalWidth={width}
          canvas={canvasRef.current}
          color={Number(`0x${color}`)}
          scale={scale}
          bias={bias}
          setScale={setScale}
          extent={extent}
        />
      )}
    </React.Fragment>
  );
}

function Chart({ wellId, data, xAxis, isEditing, dataBySection, selectedLogs, setScale, currentLogs, currentLog }) {
  const [{ labelHeight, labelWidth }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const prevXAxis = usePrevious(xAxis);
  const Labels = isEditing ? [currentLog] : currentLogs;
  const mapper = d => [Number(d[xAxis]), Number(d.value)];
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data, xAxis) : () => 1),
    [data, xAxis]
  );

  const [view, updateView] = useState({
    x: 0,
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
    zoomYScale: false,
    isXScalingValid: () => 1
  });

  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => updateLabelDimensions({ labelWidth, labelHeight }),
    []
  );

  const onScale = useCallback(() => {
    const minDepth = Math.min(...data.map(d => d[xAxis.toLowerCase()]));
    const minValue = Math.min(...data.map(d => d.value));

    updateView(view => {
      const xScale = getInitialViewXScaleValue(width - gridGutter);
      return {
        ...view,
        x: -minDepth * xScale + gridGutter,
        y: -minValue * view.yScale + 10,
        yScale: 0.4,
        xScale
      };
    });
  }, [data, xAxis, width, getInitialViewXScaleValue]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (data && data.length && width && height) {
        onScale();
      }
    },
    [width, data, height, onScale, xAxis, prevXAxis]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, data, selectedLogs, labelHeight, labelWidth, Labels]
  );

  return (
    <React.Fragment>
      <WebGlContainer ref={canvasRef} className={classes.plot} />
      <PixiContainer ref={viewportContainer} container={stage} />
      {!_.isEmpty(selectedLogs) &&
        Labels.map((log, index) => {
          const currLog = selectedLogs[log];
          const scalelo = currLog.scalelo * currLog.currScale.scale;
          const scalehi = currLog.scalehi * currLog.currScale.scale;
          const color = currLog.color;
          return (
            <PixiLabel
              key={log}
              container={stage}
              text={`${scalelo.toFixed(1)} ${log} ${scalehi.toFixed(1)}`}
              x={index * 30}
              y={0}
              height={height}
              width={30}
              updateTransform={frozenXYTransform}
              sizeChanged={onSizeChanged}
              textProps={{ fontSize: 11, color: 0xffffff, rotation: -Math.PI / 2, anchor: [1, 0] }}
              backgroundProps={{ backgroundColor: Number(`0x${color}`) }}
            />
          );
        })}

      <PixiContainer
        container={viewport}
        child={container => {
          return currentLogs.map(log => {
            const id = dataBySection[log].id;
            const showScale = isEditing && log === currentLog;
            const { scale, bias } = selectedLogs[log].currScale;
            return (
              <Line
                key={id}
                wellId={wellId}
                logId={id}
                stage={stage}
                canvasRef={canvasRef}
                width={width}
                viewport={container}
                mapper={mapper}
                refresh={refresh}
                isEditing={isEditing}
                showScale={showScale}
                selectedLogs={selectedLogs}
                setScale={setScale}
                scale={scale}
                bias={bias}
                view={view}
              />
            );
          });
        }}
      />

      <Grid
        container={viewport}
        view={view}
        width={width}
        height={height}
        gridGutter={gridGutter}
        showXAxis={false}
        showYAxis={false}
      />
    </React.Fragment>
  );
}

Chart.propTypes = {
  wellId: PropTypes.string,
  data: PropTypes.array,
  xAxis: PropTypes.string,
  isEditing: PropTypes.bool,
  dataBySection: PropTypes.object,
  selectedLogs: PropTypes.object,
  currentLogs: PropTypes.arrayOf(PropTypes.string),
  currentLog: PropTypes.string,
  setScale: PropTypes.func
};

export default Chart;
