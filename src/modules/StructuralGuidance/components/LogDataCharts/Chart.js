import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import { max, min } from "d3-array";
import _ from "lodash";

import BiasAndScale from "../../../../components/BiasAndScale";
import { useFilteredAdditionalDataInterval, useCrossSectionContainer } from "../../../App/Containers";
import classes from "./styles.scss";
import WebGlContainer from "../../../../components/WebGlContainer";
import PixiContainer from "../../../../components/PixiContainer";
import PixiLabel from "../../../../components/PixiLabel";
import { frozenXYTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiLine from "../../../../components/PixiLine";
import Grid from "../../../../components/Grid";
import { SegmentSelection } from "./Segments";
const gridGutter = 40;

const Line = React.memo(
  ({
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
    selectedLogs,
    bias
  }) => {
    const { color, data = [], label } = useFilteredAdditionalDataInterval(wellId, logId);
    const selectedColor = Number(`0x${_.get(selectedLogs, `[${label}].color`, color)}`);
    const lineScale = { x: 1, y: scale || 1 };
    const alpha = isEditing && !showScale ? 0.3 : 1;
    const extent = [min(data, d => d.value), max(data, d => d.value)];
    const height = extent[1] - extent[0];
    const computedHeight = height * scale;
    const yMin = extent[0];
    const computedYMin = yMin * scale;
    const y = bias + yMin - (computedHeight - height) / 2 - computedYMin;

    useEffect(
      function refreshWebGLRenderer() {
        if (data && data.length) {
          refresh();
        }
      },
      [refresh, data, showScale, color]
    );

    return (
      <React.Fragment>
        <PixiLine
          container={viewport}
          y={y}
          scale={lineScale}
          data={data}
          mapData={mapper}
          color={selectedColor}
          alpha={alpha}
        />
        {showScale && (
          <BiasAndScale
            container={stage}
            axis="y"
            x={width - 10}
            width={width}
            refresh={refresh}
            totalWidth={width}
            canvas={canvasRef.current}
            color={selectedColor}
            scale={scale}
            bias={bias}
            setScale={setScale}
            extent={extent}
            gridGutter={10}
          />
        )}
      </React.Fragment>
    );
  }
);

function Chart({
  wellId,
  data,
  xAxis,
  isEditing,
  dataBySection,
  selectedLogs,
  setScale,
  currentLogs,
  currentLog,
  newView
}) {
  const { calcSections, selectedSections } = useCrossSectionContainer();

  const segments = useMemo(() => {
    const index = selectedSections && calcSections.findIndex(s => selectedSections[s.id]);
    if (index > 0) return [calcSections[index - 1], calcSections[index]];

    return [];
  }, [calcSections, selectedSections]);

  const [{ labelHeight, labelWidth }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const Labels = isEditing ? [currentLog] : currentLogs;
  const mapper = useCallback(d => [Number(d[xAxis]), Number(d.value)], [xAxis]);
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

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
    zoomXScale: false,
    zoomYScale: false
  });

  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => updateLabelDimensions({ labelWidth, labelHeight }),
    []
  );

  const onScale = useCallback(
    newView => {
      const minValue = Math.min(...data.map(d => d.value));

      updateView(view => {
        return {
          ...view,
          x: newView.x - gridGutter,
          y: -minValue,
          xScale: newView.xScale
        };
      });
    },
    [data]
  );

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (data && data.length && width && height && newView) {
        onScale(newView);
      }
    },
    [width, data, height, onScale, xAxis, newView]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, data, selectedLogs, labelHeight, labelWidth, Labels, segments]
  );

  return (
    <React.Fragment>
      <WebGlContainer ref={canvasRef} className={classes.plot} />
      <PixiContainer ref={viewportContainer} container={stage} />
      {!_.isEmpty(selectedLogs) &&
        Labels.map((log, index) => {
          const currLog = selectedLogs[log];
          const scalelo = currLog.currScale.scalelo;
          const scalehi = currLog.currScale.scalehi;
          const color = currLog.color;
          return (
            <PixiLabel
              key={log}
              container={stage}
              text={`${scalelo} ${log} ${scalehi}`}
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
                view={view}
                refresh={refresh}
                isEditing={isEditing}
                mapper={mapper}
                showScale={showScale}
                selectedLogs={selectedLogs}
                setScale={setScale}
                scale={scale}
                bias={bias}
              />
            );
          });
        }}
      />

      {!isEditing && segments && segments.length > 0 && (
        <SegmentSelection segments={segments} totalHeight={height} container={viewport} view={view} axis={xAxis} />
      )}

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
  setScale: PropTypes.func,
  newView: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  })
};

export default Chart;
