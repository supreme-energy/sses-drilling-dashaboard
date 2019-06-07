import { useState, useMemo } from "react";
import { createContainer } from "unstated-next";
import memoize from "react-powertools/memoize";

import { useFormations, useProjections, useSurveys, useWellPath, useWellOverviewKPI } from "../../api";

const filterDataToInterval = memoize((data, interval) => {
  if (data && data.length && interval[0] && interval[1]) {
    return data.filter(({ md }) => valueIsBetweenInterval(md, interval));
  } else return data;
});

const valueIsBetweenInterval = (value, interval) => {
  if (interval[0] && interval[1]) {
    return interval[0] <= value && value <= interval[1];
  } else return false;
};

// Shared state for current time slider location
function useTimeSlider(initialState) {
  const [sliderInterval, setSliderInterval] = useState(initialState);
  return { sliderInterval, setSliderInterval };
}

export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(useTimeSlider);

// Shared state for current drill phase
function useDrillPhase(initialState) {
  const [drillPhaseObj, setDrillPhase] = useState(initialState);
  return { drillPhaseObj, setDrillPhase };
}

export const { Provider: DrillPhaseProvider, useContainer: useDrillPhaseContainer } = createContainer(useDrillPhase);

// Uses current time slider location to filter well Cross-Section
export function useFilteredWellData(wellId) {
  const { sliderInterval } = useTimeSliderContainer();

  const formations = useFormations(wellId);
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const projections = useProjections(wellId);

  // Filter data and memoize
  const surveysFiltered = filterDataToInterval(surveys, sliderInterval);
  const projectionsFiltered = filterDataToInterval(projections, sliderInterval);
  const formationsFiltered = formations.map(f => {
    return {
      ...f,
      data: filterDataToInterval(f.data, sliderInterval)
    };
  });

  return {
    surveys: surveysFiltered,
    wellPlan,
    formations: formationsFiltered,
    projections: projectionsFiltered
  };
}

// Organize well sections into array of objects
export function useWellSections() {
  const wellOverviewSections = useWellOverviewKPI();
  const drillPhases = useMemo(() => {
    return Array.from(wellOverviewSections.bySegment.entries()).map((value, index) => {
      return {
        index,
        phase: value[0],
        phaseStart: Math.min(value[1].map(s => s.holeDepthStart)),
        phaseEnd: Math.max(value[1].map(s => s.depth)),
        inView: true
      };
    });
  }, [wellOverviewSections.bySegment]);

  return drillPhases;
}
