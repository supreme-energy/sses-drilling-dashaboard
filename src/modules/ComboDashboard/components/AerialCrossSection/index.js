import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useState
} from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { useSize } from "react-hook-size";
import { scaleLinear, scaleThreshold } from "d3-scale";
import { max, group } from "d3-array";

import PixiContainer from "../../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiLine from "../../../WellExplorer/components/WellOverview/ROP/PixiLine";
import Grid from "../../../WellExplorer/components/WellOverview/ROP/Grid";
import { useWebGLRenderer } from "../../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import useViewport from "../../../WellExplorer/components/WellOverview/ROP/useViewport";
import {
  useWellOverviewKPI,
  useWells,
  useWellPath,
  useWellsMapLength,
  useSurveys
} from "../../../../api";
import * as wellSections from "../../../../constants/wellSections";

import WidgetCard from "../../../WidgetCard";
import classes from "./AerialCrossSection.scss";

// TODO export from WellExplorer, or move to const
const colorsBySection = {
  [wellSections.INTERMEDIATE]: 0x538531,
  [wellSections.DRILLOUT]: 0x7c7c7c,
  [wellSections.LATERAL]: 0xc39200,
  drilling: 0x7500a6
};

function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([data[0].mapPosition.y, data[data.length - 1].mapPosition.y])
      .range([0, 1]);
  }
}

function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([data[0].mapPosition.x, data[data.length - 1].mapPosition.x])
      .range([0, 1]);
  }
}

function getSurveyBySection(surveyMapPositions, wellOverviewDataBySection) {
  if (wellOverviewDataBySection.size === 0 || surveyMapPositions.length === 0) {
    return new Map();
  }

  const sections = [
    wellSections.INTERMEDIATE,
    wellSections.DRILLOUT,
    wellSections.LATERAL
  ].filter(s => wellOverviewDataBySection.get(s));

  // scale::(Number) =>  INTERMEDIATE | LATERAL ...
  const scale = scaleThreshold()
    .domain(
      sections.map(s =>
        max(wellOverviewDataBySection.get(s), d => Number(d.depth))
      )
    )
    .range(sections);

  const groups = group(
    surveyMapPositions.slice(0, surveyMapPositions.length - 1),
    d => scale(Number(d.md))
  );

  const drilling =
    surveyMapPositions.length > 1
      ? [
          surveyMapPositions[surveyMapPositions.length - 1],
          surveyMapPositions[surveyMapPositions.length - 2]
        ]
      : [];
  groups.set("drilling", drilling);
  return groups;
}

const mapCrossSection = d => {
  return [Number(d.mapPosition.x), Number(d.mapPosition.y)];
};

function AerialCrossSection({ wellId }) {
  const [, wellsById] = useWells();
  const wellPathData = useWellPath(wellId);
  const wellPathMapPositions = useWellsMapLength(wellId, wellPathData);
  const surveyData = useSurveys(wellId);
  const surveyMapPositions = useWellsMapLength(wellId, surveyData);

  // TODO ADD MARKERS TO SELECTED WELL
  const selectedWell = wellsById[wellId];

  const { bySegment: wellOverviewBySegment } = useWellOverviewKPI();
  const surveysBySection = useMemo(
    () => getSurveyBySection(surveyMapPositions, wellOverviewBySegment),
    [wellOverviewBySegment, surveyMapPositions]
  );

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({
    canvas: canvasRef.current,
    width,
    height
  });

  const getInitialViewYScaleValue = useMemo(
    () =>
      wellPathMapPositions && wellPathMapPositions.length
        ? computeInitialViewYScaleValue(wellPathMapPositions)
        : () => 1,
    [wellPathMapPositions]
  );

  const getInitialViewXScaleValue = useMemo(
    () =>
      wellPathMapPositions && wellPathMapPositions.length
        ? computeInitialViewXScaleValue(wellPathMapPositions)
        : () => 1,
    [wellPathMapPositions]
  );

  const [view, updateView] = useState({
    x: 0,
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
    zoomXScale: true,
    zoomYScale: true,
    isXScalingValid: () => 1
  });

  const onReset = useCallback(() => {
    const xMin = Math.min(
      wellPathMapPositions[0].mapPosition.x,
      wellPathMapPositions[wellPathMapPositions.length - 1].mapPosition.x
    );
    const yMin = Math.min(
      wellPathMapPositions[0].mapPosition.y,
      wellPathMapPositions[wellPathMapPositions.length - 1].mapPosition.y
    );
    updateView(view => ({
      ...view,
      x:
        getInitialViewXScaleValue(width) *
        wellPathMapPositions[0].mapPosition.x *
        -1,
      y:
        getInitialViewYScaleValue(height) *
        wellPathMapPositions[0].mapPosition.y *
        -1,
      yScale: getInitialViewYScaleValue(height) - 5,
      xScale: getInitialViewXScaleValue(width) - 5
    }));
  }, [getInitialViewYScaleValue, getInitialViewXScaleValue, width, height]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (
        wellPathMapPositions &&
        wellPathMapPositions.length &&
        width &&
        height &&
        !scaleInitialized.current
      ) {
        onReset();
        scaleInitialized.current = true;
      }
    },
    [width, wellPathMapPositions, height, onReset]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, wellPathMapPositions, view, width, height]
  );

  // value * view.xScale; = view.x
  return (
    <WidgetCard className={classes.crossSection}>
      <Typography variant="subtitle1">Cross Section</Typography>
      <div className={classes.aerialCrossSectionCanvas} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />

        <PixiLine
          container={viewport}
          data={wellPathMapPositions}
          mapData={mapCrossSection}
          color={0x72b600}
        />
        {[...surveysBySection].map(([section, sectionData]) => (
          <PixiLine
            key={section}
            container={viewport}
            data={sectionData}
            mapData={mapCrossSection}
            color={colorsBySection[section]}
          />
        ))}
        <Grid container={viewport} view={view} width={width} height={height} />
      </div>
    </WidgetCard>
  );
}

AerialCrossSection.propTypes = {
  wellId: PropTypes.string
};

export default AerialCrossSection;
