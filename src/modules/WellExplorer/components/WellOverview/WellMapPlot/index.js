import React, { useMemo, useRef } from "react";
import LeafletMap from "../../WellMap/Map";
import { useWells, useWellPath, useWellsMapPosition, useSurveys, useWellOverviewKPI } from "../../../../../api";
import { connect } from "react-redux";
import classNames from "classnames";
import classes from "./styles.scss";
import WellsLayer from "../../WellMap/WellsLayer";
import WellPhasePointsLayer from "./WellPhasePointsLayer";
import { Polyline } from "react-leaflet";
import { group, max } from "d3-array";
import { scaleThreshold } from "d3-scale";
import * as wellSections from "../../../../../constants/wellSections";
import Legend from "./Legend";

const colorsBySection = {
  [wellSections.INTERMEDIATE]: "#538531",
  [wellSections.DRILLOUT]: "#7C7C7C",
  [wellSections.LATERAL]: "#C39200",
  drilling: "#7500A6"
};

function getValidBounds(bounds) {
  // no bounds or not valid or partial no bounds
  if (!bounds || !bounds.isValid() || !bounds.getNorthEast() || !bounds.getSouthWest()) {
    return null;
  }

  // valid bounds
  if (!bounds.getNorthEast().equals(bounds.getSouthWest())) {
    return bounds.pad(0.07);
  }
  return bounds.getNorthEast().toBounds(100);
}

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
  groups.set("drilling", drilling);
  return groups;
}

function WellMapPlot({ className, selectedWellId }) {
  const [, wellsById] = useWells();
  const wellPathData = useWellPath(selectedWellId);
  const wellPathMapPositions = useWellsMapPosition(selectedWellId, wellPathData);
  const surveyData = useSurveys(selectedWellId);
  const surveyMapPositions = useWellsMapPosition(selectedWellId, surveyData);

  const selectedWell = wellsById[selectedWellId];

  const mapContainer = useRef(null);
  const phasePointsRef = useRef(null);
  const { current: phasePoints } = phasePointsRef;
  const bounds = phasePoints && phasePoints.getBounds();
  const validBounds = useMemo(() => getValidBounds(bounds), [bounds]);

  const { bySegment: wellOverviewBySegment } = useWellOverviewKPI();
  const surveysBySection = useMemo(() => getSurveyBySection(surveyMapPositions, wellOverviewBySegment), [
    wellOverviewBySegment,
    surveyMapPositions
  ]);

  return (
    <div ref={mapContainer} className={classNames(className, classes.mapContainer)}>
      <LeafletMap bounds={validBounds} className={classNames(className, classes.map)} zoomControl={false}>
        {selectedWell && <WellsLayer wells={[selectedWell]} selectedWellId={selectedWellId} />}
        <WellPhasePointsLayer ref={phasePointsRef} wellId={selectedWellId} zIndexOffset={30} />
        <Polyline positions={wellPathMapPositions.map(d => [d.mapPosition.y, d.mapPosition.x])} color="#72B600" />
        {[...surveysBySection].map(([section, sectionData]) => (
          <Polyline
            key={section}
            positions={sectionData.map(d => [d.mapPosition.y, d.mapPosition.x])}
            color={colorsBySection[section]}
          />
        ))}
      </LeafletMap>
      <Legend className={classes.legend} />
    </div>
  );
}

const mapStateToProps = state => {
  return {
    selectedWellId: state.wellExplorer.selectedWellId
  };
};

export default connect(
  mapStateToProps,
  null
)(WellMapPlot);
