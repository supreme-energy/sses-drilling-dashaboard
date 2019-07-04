import { useState, useCallback, useMemo, useReducer, useEffect } from "react";
import { createContainer } from "unstated-next";

import memoize from "react-powertools/memoize";

import {
  useFetchFormations,
  useFetchProjections,
  useFetchSurveys,
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

// Uses current time slider location to filter well Cross-Section
export function useFilteredWellData() {
  const { sliderInterval } = useTimeSliderContainer();

  const { wellId } = useWellIdContainer();

  const { formationsData, refreshFormations } = useFormationsDataContainer();
  const { surveysData } = useSurveysDataContainer();
  const { projectionsData, saveProjections, refreshProjections } = useProjectionsDataContainer();
  const wellPlan = useWellPath(wellId);

  // Filter data and memoize
  const surveysFiltered = filterDataToInterval(surveysData, sliderInterval);
  const projectionsFiltered = filterDataToInterval(projectionsData, sliderInterval);
  const formationsFiltered = formationsData.map(f => {
    return {
      ...f,
      data: filterDataToInterval(f.data, sliderInterval)
    };
  });

  const saveAndUpdate = useCallback(
    (...args) => {
      saveProjections(...args).then((data, err) => {
        if (!err) {
          refreshFormations();
          refreshProjections();
        }
      });
    },
    [saveProjections, refreshProjections, refreshFormations]
  );

  // TODO: Remove once formations are stabilized again
  useEffect(() => {
    const lens = formationsData.map(l => l.data.length);
    if (lens.length && Math.max(...lens) !== Math.min(...lens)) {
      console.warn("Data arrays are not all the same!");
      console.warn(lens);
      console.warn(formationsData);
    }
  }, [formationsData]);

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

function useSurveysData() {
  const { wellId } = useWellIdContainer();
  const [surveysData, setSurveys] = useState([]);

  const surveys = useFetchSurveys(wellId);

  useEffect(() => {
    // TODO Check timestamp or something to determine if we should update with server data
    if (surveys && surveys.length) {
      console.log("setting new surveys");
      setSurveys(surveys);
    }
  }, [surveys, setSurveys]);

  return { surveysData, setSurveys };
}

function useProjectionsData() {
  const { wellId } = useWellIdContainer();
  const [projectionsData, projectionsDispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "serverReset":
        return action.data;
      default:
        throw new Error(`Unknown action type ${action.type}`);
    }
  }, []);

  const [projections, refreshProjections, saveProjections] = useFetchProjections(wellId);

  useEffect(() => {
    // TODO Check timestamp or something to determine if we should update with server data
    if (projections && projections.length) {
      console.log("setting new projections");
      projectionsDispatch({
        type: "serverReset",
        data: projections
      });
    }
  }, [projections]);

  return { projectionsData, projectionsDispatch, saveProjections, refreshProjections };
}

function useFormationsData() {
  const { wellId } = useWellIdContainer();
  const { projectionsData } = useProjectionsDataContainer();
  const [formationsData, setFormations] = useState([]);

  const [serverFormations, refreshFormations] = useFetchFormations(wellId);

  useEffect(() => {
    // TODO Check timestamp or something to determine if we should update with server data
    if (serverFormations && serverFormations.length) {
      console.log("setting new formations");
      setFormations(serverFormations);
    }
  }, [serverFormations]);

  // If projections or surveys change, recalculate formations
  useEffect(() => {
    // TODO: calculate formations from surveys, projections, and formations
    // https://github.com/supreme-energy/sses-main/blob/master/sses_af/calccurve.c
  }, [projectionsData]);

  return { formationsData, setFormations, refreshFormations };
}

// Create containers
export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(useTimeSlider);
export const { Provider: DrillPhaseProvider, useContainer: useDrillPhaseContainer } = createContainer(useDrillPhase);
export const { Provider: AppStateProvider, useContainer: useAppState } = createContainer(useAppStateData);
export const { Provider: WellIdProvider, useContainer: useWellIdContainer } = createContainer(useWellId);
export const { Provider: FormationsProvider, useContainer: useFormationsDataContainer } = createContainer(
  useFormationsData
);
export const { Provider: SurveysProvider, useContainer: useSurveysDataContainer } = createContainer(useSurveysData);
export const { Provider: ProjectionsProvider, useContainer: useProjectionsDataContainer } = createContainer(
  useProjectionsData
);
