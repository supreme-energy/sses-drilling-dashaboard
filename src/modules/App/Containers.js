import { useState, useCallback, useMemo, useReducer, useEffect } from "react";
import { createContainer } from "unstated-next";

import memoize from "react-powertools/memoize";

import {
  useFormations,
  useProjections,
  useSurveys,
  useWellOverviewKPI,
  useWellPath,
  useAdditionalDataLog
} from "../../api";
import { drillPhaseReducer } from "./reducers";

const filterDataToInterval = memoize((data, interval) => {
  if (data && data.length) {
    return data.filter(({ md }) => interval[0] <= md && md <= interval[1]);
  } else {
    return [];
  }
});

const filterDataToLast = memoize((data, lastDepth) => {
  if (data && data.length) {
    return data.find(({ md }) => md >= lastDepth);
  } else {
    return {};
  }
});

// Shared state for current time slider location
function useTimeSlider(initialState) {
  const [sliderInterval, setSliderInterval] = useState(initialState);
  return { sliderInterval, setSliderInterval };
}

// Shared state for current drill phase
function useDrillPhase(initialState) {
  const [drillPhaseObj, setDrillPhase] = useReducer(drillPhaseReducer, initialState);
  return { drillPhaseObj, setDrillPhase };
}

function useAppStateData() {
  const [requestId, updateRequestId] = useState(0);

  const refreshRequestId = useCallback(() => {
    const now = Date.now();
    updateRequestId(now);
  }, []);
  return { requestId, updateRequestId, refreshRequestId };
}

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
export function useFilteredWellData() {
  const { sliderInterval } = useTimeSliderContainer();

  const { wellId } = useWellIdContainer();

  const [formations, refreshFormations] = useFormations(wellId);
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const [projections, refreshProjections, saveProjection] = useProjections(wellId);

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

  const saveAndUpdate = useCallback(
    (...args) => {
      saveProjection(...args).then((data, err) => {
        if (!err) {
          refreshFormations();
          refreshProjections();
        }
      });
    },
    [saveProjection, refreshProjections, refreshFormations]
  );

  // TODO: Remove once formations are stabilized again
  useEffect(() => {
    const lens = formations.map(l => l.data.length);
    if (lens.length && Math.max(...lens) !== Math.min(...lens)) {
      console.warn("Data arrays are not all the same!");
      console.warn(lens);
      console.warn(formations);
    }
  }, [formations]);

  return {
    surveys: surveysFiltered,
    wellPlan,
    formations: formationsFiltered,
    projections: projectionsFiltered,
    saveProjection: saveAndUpdate
  };
}

// Uses current time slider location to filter additional data logs
export function useFilteredAdditionalDataLogs(wellId, id) {
  const { sliderInterval } = useTimeSliderContainer();

  const { label, data, scalelo, scalehi } = useAdditionalDataLog(wellId, id);

  return {
    label,
    scalelo,
    scalehi,
    ...filterDataToLast(data, sliderInterval[1])
  };
}

// Organize well sections into array of objects
export function useWellSections() {
  const { data } = useWellOverviewKPI();
  const drillPhases = useMemo(() => {
    return data.map((s, index) => {
      return {
        index,
        phase: s.type,
        phaseStart: s.holeDepthStart,
        phaseEnd: s.depth,
        inView: true,
        set: false
      };
    });
  }, [data]);

  return drillPhases;
}

function useWellId(initialState) {
  const [wellId, setWellId] = useState(initialState);
  return { wellId, setWellId };
}

// Create containers
export const { Provider: WellIdProvider, useContainer: useWellIdContainer } = createContainer(useWellId);
export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(useTimeSlider);
export const { Provider: DrillPhaseProvider, useContainer: useDrillPhaseContainer } = createContainer(useDrillPhase);
export const { Provider: AppStateProvider, useContainer: useAppState } = createContainer(useAppStateData);
