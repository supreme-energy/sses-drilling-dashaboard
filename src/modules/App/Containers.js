import { useMemo, useState } from "react";
import memoize from "react-powertools/memoize";
import { createContainer } from "unstated-next";
import { useFormations, useProjections, useSurveys, useWellOverviewKPI, useWellPath } from "../../api";

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

const annotateSurveys = memoize(fullSurveyList => {
  // Bit projection is not always in list of surveys
  const hasBitProj = fullSurveyList.some(s => s.plan === 1);
  return fullSurveyList.map((s, i, l) => {
    // If included, bit projection is always the last item and the last survey is second to last
    const isBitProj = i === l.length - 1 && hasBitProj;
    const isLastSurvey = i === l.length - 1 - hasBitProj * 1;
    return {
      ...s,
      isBitProj: isBitProj,
      isSurvey: !isBitProj,
      isLastSurvey: isLastSurvey,
      color: isBitProj ? 0xff00ff : isLastSurvey ? 0x0000ff : 0xa6a6a6,
      alpha: 0.5,
      selectedColor: isBitProj ? 0xff00ff : isLastSurvey ? 0x0000ff : 0x000000,
      selectedAlpha: 1
    };
  });
});
const annotateProjections = memoize(projections => {
  return projections.map(p => {
    return {
      ...p,
      isProjection: true,
      color: 0xee2211,
      selectedColor: 0xee2211,
      alpha: 0.5,
      selectedAlpha: 1
    };
  });
});

// Uses current time slider location to filter well Cross-Section
export function useFilteredWellData(wellId) {
  const { sliderInterval } = useTimeSliderContainer();

  const formations = useFormations(wellId);
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const projections = useProjections(wellId);

  // Calculate some useful information from raw data
  const annotatedSurveys = annotateSurveys(surveys);
  const annotatedProjections = annotateProjections(projections);

  // Filter data and memoize
  const surveysFiltered = filterDataToInterval(annotatedSurveys, sliderInterval);
  const projectionsFiltered = filterDataToInterval(annotatedProjections, sliderInterval);
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
