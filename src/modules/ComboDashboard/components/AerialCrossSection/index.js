import React, { useRef, useMemo, useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { useSize } from "react-hook-size";
import { scaleThreshold } from "d3-scale";
import { max, group } from "d3-array";

import PixiMarker from "./PixiMarker";
import { useFilteredWellData } from "../../../App/Containers";

import { useWellOverviewKPI, useWellInfo, useWellsMapLength } from "../../../../api";
import * as wellSections from "../../../../constants/wellSections";
import SurfaceMarker from "../../assets/aerialCSMarkerBlue.svg";
import LandingMarker from "../../assets/aerialCSMarkerGreen.svg";
import PbhlMarker from "../../assets/aerialCSMarkerPink.svg";
import Compass from "../../assets/compass.svg";

import WidgetCard from "../../../WidgetCard";
import classes from "./AerialCrossSection.scss";
import PixiContainer from "../../../../components/PixiContainer";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiLine from "../../../../components/PixiLine";

// TODO export from WellExplorer, or move to const
const colorsBySection = {
  [wellSections.INTERMEDIATE]: 0x538531,
  [wellSections.DRILLOUT]: 0x7c7c7c,
  [wellSections.LATERAL]: 0xc39200,
  drilling: 0x7500a6
};

function getSurveyBySection(surveyMapPositions, wellOverviewDataBySection) {
  if (wellOverviewDataBySection.size === 0 || surveyMapPositions.length === 0) {
    return new Map();
  }

  const sections = [wellSections.INTERMEDIATE, wellSections.DRILLOUT, wellSections.LATERAL].filter(s =>
    wellOverviewDataBySection.get(s)
  );

  // scale::(Number) =>  INTERMEDIATE | LATERAL ...
  const scale = scaleThreshold()
    .domain(sections.map(s => max(wellOverviewDataBySection.get(s), d => Number(d.depth))))
    .range(sections);

  const groups = group(surveyMapPositions.slice(0, surveyMapPositions.length - 1), d => scale(Number(d.md)));

  const drilling =
    surveyMapPositions.length > 1
      ? [surveyMapPositions[surveyMapPositions.length - 1], surveyMapPositions[surveyMapPositions.length - 2]]
      : [];

  if (groups.get(wellSections.LATERAL) && groups.get(wellSections.LATERAL).length) {
    groups.set("drilling", drilling);
  }
  return groups;
}

const mapCrossSection = d => [Number(d.mapPosition.x), Number(d.mapPosition.y)];
const mapCrossSectionRotated = d => [Number(d.mapPosition.y), Number(d.mapPosition.x)];
const SCALE_FACTOR = 0.025;

/* eslint new-cap: 0 */
function AerialCrossSection({ wellId }) {
  const { surveys, wellPlan } = useFilteredWellData(wellId);
  const [{ wellSurfaceLocationLocal = {}, wellLandingLocationLocal = {}, wellPBHLLocal = {} }] = useWellInfo(wellId);
  const surveyData = useWellsMapLength(wellId, surveys);
  const wellPlanData = useWellsMapLength(wellId, wellPlan);
  const yDistance = Math.abs(wellPBHLLocal.y - wellSurfaceLocationLocal.y);
  const xDistance = Math.abs(wellPBHLLocal.x - wellSurfaceLocationLocal.x);
  let rotate = false;
  if (yDistance || xDistance) {
    rotate = yDistance > xDistance;
  } else if (wellPlanData && wellPlanData.length) {
    const { x: iniX, y: iniY } = wellPlanData[0].mapPosition;
    const { x: finX, y: finY } = wellPlanData[wellPlanData.length - 1].mapPosition;
    rotate = finY - iniY > finX - iniX;
  }
  const xMin = wellPlanData.length > 0 ? -wellPlanData[0].mapPosition.x : 0;
  const yMin = wellPlanData.length > 0 ? -wellPlanData[0].mapPosition.y : 0;
  const xValue = rotate ? yMin : xMin;
  const yValue = rotate ? xMin : yMin;

  const { bySegment: wellOverviewBySegment } = useWellOverviewKPI(wellId);

  const surveysBySection = useMemo(() => getSurveyBySection(surveyData, wellOverviewBySegment), [
    wellOverviewBySegment,
    surveyData
  ]);

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

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

  const onScale = useCallback(() => {
    updateView(view => {
      return {
        ...view,
        x: xValue * SCALE_FACTOR + 30,
        y: yValue * SCALE_FACTOR + 40,
        yScale: SCALE_FACTOR,
        xScale: SCALE_FACTOR
      };
    });
  }, [xValue, yValue]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (wellPlanData && wellPlanData.length && width && height && !scaleInitialized.current) {
        onScale();
        scaleInitialized.current = true;
      }
    },
    [width, wellPlanData, wellPBHLLocal, height, onScale]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, wellPlanData, view, width, height, surveysBySection]
  );

  const surfaceMarkerCoord = {
    x: rotate ? wellSurfaceLocationLocal.y : wellSurfaceLocationLocal.x,
    y: rotate ? wellSurfaceLocationLocal.x : wellSurfaceLocationLocal.y
  };

  const landingMarkerCoord = {
    x: rotate ? wellLandingLocationLocal.y : wellLandingLocationLocal.x,
    y: rotate ? wellLandingLocationLocal.x : wellLandingLocationLocal.y
  };

  const pbhlMarkerCoord = {
    x: rotate ? wellPBHLLocal.y : wellPBHLLocal.x,
    y: rotate ? wellPBHLLocal.x : wellPBHLLocal.y
  };

  return (
    <WidgetCard className={classes.crossSection} hideMenu>
      <Typography variant="subtitle1">Cross Section</Typography>
      <div className={classes.aerialCrossSectionCanvas} ref={canvasRef}>
        <PixiContainer ref={viewportContainer} container={stage} />

        <PixiLine
          container={viewport}
          data={wellPlanData}
          mapData={rotate ? mapCrossSectionRotated : mapCrossSection}
          color={0x72b600}
          lineWidth={250}
          nativeLines={false}
        />
        {[...surveysBySection].map(([section, sectionData]) => {
          return (
            <PixiLine
              key={section}
              container={viewport}
              data={sectionData}
              mapData={rotate ? mapCrossSectionRotated : mapCrossSection}
              color={colorsBySection[section]}
              lineWidth={300}
              nativeLines={false}
            />
          );
        })}

        <PixiMarker container={viewport} url={SurfaceMarker} x={surfaceMarkerCoord.x} y={surfaceMarkerCoord.y} />
        <PixiMarker container={viewport} url={LandingMarker} x={landingMarkerCoord.x} y={landingMarkerCoord.y} />
        <PixiMarker container={viewport} url={PbhlMarker} y={pbhlMarkerCoord.y} x={pbhlMarkerCoord.x} />
        {wellPlanData.length > 0 && (
          <PixiMarker
            container={viewport}
            url={Compass}
            x={-xValue - 30 / SCALE_FACTOR}
            y={-yValue + 40 / SCALE_FACTOR}
          />
        )}
      </div>
    </WidgetCard>
  );
}

AerialCrossSection.propTypes = {
  wellId: PropTypes.string
};

export default AerialCrossSection;
