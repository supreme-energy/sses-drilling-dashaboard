import React, { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import _ from "lodash";

import useRef from "react-powertools/hooks/useRef";

import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { COLOR_BY_GRAPH, ACTUAL, PLAN, TARGET_BOUNDARY } from "../../../../constants/drillingAnalytics";
import PixiLine from "../../../../components/PixiLine";
import PixiContainer from "../../../../components/PixiContainer";
import PixiPolygon from "../../../../components/PixiPolygon";
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

export function VerticalCrossSection({
  className,
  selectedMenuItems,
  keys,
  wellPlanFiltered,
  surveys,
  formations = [],
  isLateral,
  hasPhaseChanged
}) {
  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });
  const data = wellPlanFiltered && surveys && wellPlanFiltered.length > surveys.length ? wellPlanFiltered : surveys;
  const lastSurveyDepth =
    surveys && surveys.length && surveys[surveys.length - 1].isLastSurvey ? surveys[surveys.length - 1].md : 0;

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
    if (isLateral) {
      updateView(view => ({
        x: 0 - 10 * view.xScale,
        y: -850 * 2 - getInitialViewYScaleValue(height + 800),
        yScale: getInitialViewYScaleValue(height + 700) * 2,
        xScale: getInitialViewXScaleValue(width - 10 / data.length)
      }));
    } else if (hasPhaseChanged) {
      updateView(view => ({
        ...view,
        x: -15,
        y: -2300,
        yScale: getInitialViewYScaleValue(height + 700) * 2,
        xScale: getInitialViewXScaleValue(width - 10 / data.length)
      }));
    } else {
      updateView(view => ({
        ...view,
        x: 0 - 15 * view.xScale,
        y: -2300,
        yScale: getInitialViewYScaleValue(height + 700) * 2,
        xScale: getInitialViewXScaleValue(width - 10 / data.length)
      }));
    }
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height, data, isLateral, hasPhaseChanged]);

  // set initial scale
  useEffect(() => {
    if (data && data.length && width && height) {
      onReset();
    }
  }, [width, data, height, onReset]);

  useEffect(() => {
    refresh();
  }, [refresh, stage, surveys, formations, wellPlanFiltered, view, width, height, selectedMenuItems]);

  const sectionsData = useMemo(() => {
    return formations.map((layer, layerIndex) => {
      if (layerIndex < formations.length - 1) {
        return layer.data.map((l, dataIndex) => {
          if (dataIndex < layer.data.length - 1) {
            const isLastSurveyDepth = lastSurveyDepth ? lastSurveyDepth <= l.md : false;
            const p1 = l; // currLayer
            const p2 = layer.data[dataIndex + 1]; //
            const p3 = formations[layerIndex + 1].data[dataIndex + 1];
            const p4 = formations[layerIndex + 1].data[dataIndex];

            // The right side points determine the tile fault
            const a1 = [p1.vs, p1.tot + p2.fault];
            const a2 = [p2.vs, p2.tot];
            const a3 = [p3.vs, p3.tot];
            const a4 = [p4.vs, p4.tot + p3.fault];
            const tilePath = [...a1, ...a2, ...a3, ...a4];

            return {
              label: layer.label,
              color: Number(`0x${layer.bg_color}`),
              alpha: isLastSurveyDepth ? 0.3 : Number(layer.bg_percent),
              data: tilePath
            };
          } else {
            return {
              data: {}
            };
          }
        });
      } else {
        return [];
      }
    });
  }, [formations, lastSurveyDepth]);

  return (
    <React.Fragment>
      <Legend selectedGraphs={selectedMenuItems} keys={keys} />
      <div className={isLateral ? classes.tvdGraphContainerMin : classes.tvdGraphContainer} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />

        {sectionsData.map(s => {
          return s.map(({ label, data, color, alpha }, index) => {
            if (!_.isEmpty(data)) {
              return (
                <PixiPolygon
                  updateTransform={null}
                  key={label + index}
                  container={viewport}
                  path={data}
                  backgroundColor={color}
                  alpha={alpha}
                />
              );
            }
          });
        })}

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

        {wellPlanFiltered && wellPlanFiltered.length > 0 && selectedMenuItems.includes(PLAN) && (
          <PixiContainer
            container={viewport}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                container={container}
                view={view}
                data={wellPlanFiltered}
                mapData={mapValues}
                color={COLOR_BY_GRAPH[PLAN].hex}
                nativeLines={false}
                lineWidth={3}
              />
            )}
          />
        )}
        {surveys && surveys.length > 0 && selectedMenuItems.includes(ACTUAL) && (
          <PixiContainer
            container={viewport}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                container={container}
                view={view}
                data={surveys}
                mapData={mapValues}
                color={COLOR_BY_GRAPH[ACTUAL].hex}
                nativeLines={false}
                lineWidth={3}
              />
            )}
          />
        )}
        <Grid container={viewport} view={view} width={width} height={height} gridGutter={gridGutter} />
      </div>
    </React.Fragment>
  );
}

VerticalCrossSection.propTypes = {
  className: PropTypes.string,
  wellPlanFiltered: PropTypes.arrayOf(PropTypes.object),
  surveys: PropTypes.arrayOf(PropTypes.object),
  formations: PropTypes.arrayOf(PropTypes.object),
  keys: PropTypes.arrayOf(PropTypes.string),
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  isLateral: PropTypes.bool,
  hasPhaseChanged: PropTypes.bool
};

export default VerticalCrossSection;
