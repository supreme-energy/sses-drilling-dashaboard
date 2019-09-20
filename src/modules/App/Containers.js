import { useCallback, useMemo, useReducer, useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import usePrevious from "react-use/lib/usePrevious";
import {
  useAdditionalDataLog,
  useFetchFormations,
  useFetchProjections,
  useFetchSurveys,
  useWellOverviewKPI,
  useWellPath,
  useWellInfo,
  useWellControlLogList
} from "../../api";
import { drillPhaseReducer, selectedLogReducer } from "./reducers";
import { ALL } from "../../constants/wellSections";
import { useComboContainer, useAddProjection, useDeleteProjection } from "../ComboDashboard/containers/store";
import { useComputedFormations, useComputedSurveysAndProjections } from "../Interpretation/selectors";
import memoizeOne from "memoize-one";
import { useSelectionActions } from "../Interpretation/actions";

const filterDataToInterval = (data, interval) => {
  if (data && data.length) {
    return data.filter(({ md }) => interval.firstDepth <= md && md <= interval.lastDepth);
  } else {
    return [];
  }
};

const filterDataToLast = (data, lastDepth) => {
  if (data && data.length) {
    return data.find(({ md }) => md >= lastDepth);
  } else {
    return {};
  }
};

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

// Shared state for Cloud Server Modal Countdown
function useCloudServerCountdown(initialState) {
  const [interval, setAutoCheckInterval] = useState(initialState);
  const [countdown, setCountdown] = useState(initialState);
  const prevInterval = usePrevious(interval);

  const resetCountdown = () => setCountdown(interval);
  const handleCountdown = () => setCountdown(count => count - 1);

  useEffect(() => {
    const intervalChanged = interval !== prevInterval;
    if (intervalChanged || !countdown) {
      setCountdown(interval);
    }
  }, [interval, prevInterval, countdown]);

  return { countdown, interval, setAutoCheckInterval, handleCountdown, resetCountdown };
}

function useAppStateData() {
  const [requestId, updateRequestId] = useState(0);

  const refreshRequestId = useCallback(() => {
    const now = Date.now();
    updateRequestId(now);
  }, []);
  return { requestId, updateRequestId, refreshRequestId };
}

const filterFormationsMem = memoizeOne((formationsData, sliderInterval) => {
  return formationsData.map(f => {
    return {
      ...f,
      data: filterDataToInterval(f.data, sliderInterval)
    };
  });
});

const filterSurveysToInterval = memoizeOne(filterDataToInterval);
const filterProjectionsToInterval = memoizeOne(filterDataToInterval);
const filterWellPlanToInterval = memoizeOne(filterDataToInterval);

// Uses current time slider location to filter well Cross-Section
export function useComputedFilteredWellData() {
  const { sliderInterval } = useTimeSliderContainer();

  const { formationsData } = useFormationsDataContainer();

  const [, surveys, projections] = useComputedSurveysAndProjections();
  const [wellPlan] = useWellPlanDataContainer();

  // Filter data and memoize
  const wellPlanFiltered = filterWellPlanToInterval(wellPlan, sliderInterval);
  const surveysFiltered = filterSurveysToInterval(surveys, sliderInterval);
  const projectionsFiltered = filterProjectionsToInterval(projections, sliderInterval);
  const formationsFiltered = filterFormationsMem(formationsData, sliderInterval);

  return {
    surveys: surveysFiltered,
    wellPlan,
    wellPlanFiltered,
    formations: formationsFiltered,
    projections: projectionsFiltered
  };
}

export function useFilteredWellData() {
  const { sliderInterval } = useTimeSliderContainer();

  const [wellPlan] = useWellPlanDataContainer();
  const { surveys } = useSurveysDataContainer();
  const { serverFormations: formations } = useFormationsDataContainer();
  const { projections } = useProjectionsDataContainer();

  // Filter data and memoize
  const wellPlanFiltered = filterWellPlanToInterval(wellPlan, sliderInterval);
  const surveysFiltered = filterSurveysToInterval(surveys, sliderInterval);
  const projectionsFiltered = filterProjectionsToInterval(projections, sliderInterval);
  const formationsFiltered = filterFormationsMem(formations, sliderInterval);

  return {
    surveys: surveysFiltered,
    wellPlan,
    wellPlanFiltered,
    formations: formationsFiltered,
    projections: projectionsFiltered
  };
}

// Uses current time slider location to filter additional data logs
export function useFilteredAdditionalDataLogs(wellId, id) {
  const { sliderInterval } = useTimeSliderContainer();

  const {
    data: { label, data, scalelo, scalehi }
  } = useAdditionalDataLog(wellId, id);

  return {
    label,
    scalelo,
    scalehi,
    ...filterDataToLast(data, sliderInterval.lastDepth)
  };
}

export function useFilteredAdditionalDataInterval(wellId, id) {
  const { sliderInterval } = useTimeSliderContainer();

  const {
    data: { label, data, scalelo, scalehi, color }
  } = useAdditionalDataLog(wellId, id);

  return {
    label,
    scalelo,
    scalehi,
    color,
    data: filterDataToInterval(data, sliderInterval)
  };
}

// Organize well sections into array of objects
export function useWellSections(wellId) {
  const { data } = useWellOverviewKPI(wellId);

  const drillPhases = useMemo(() => {
    const drillPhaseArr = data.map((s, index) => {
      return {
        index,
        phase: s.type,
        phaseStart: s.holeDepthStart,
        phaseEnd: s.depth,
        inView: true,
        set: false
      };
    });

    drillPhaseArr.unshift({
      phase: ALL,
      phaseStart: 0,
      phaseEnd: Infinity,
      inView: true,
      set: false
    });

    return drillPhaseArr;
  }, [data]);

  return drillPhases;
}

function useWellId(initialState) {
  const [wellId, setWellId] = useState(initialState);
  return { wellId, setWellId };
}

function useWellPlanData() {
  const { wellId } = useWellIdContainer();
  return useWellPath(wellId);
}

function useControlLogListData() {
  const { wellId } = useWellIdContainer();
  return useWellControlLogList(wellId);
}

function useSurveysData() {
  const { wellId } = useWellIdContainer();

  const [surveys, { updateSurvey, refresh, replaceResult, isLoading }] = useFetchSurveys(wellId);

  return { updateSurvey, surveys, refreshSurveys: refresh, replaceResult, isLoading };
}

function useProjectionsData() {
  const { wellId } = useWellIdContainer();
  const [
    projections,
    refreshProjections,
    updateProjection,
    deleteProjection,
    addProjection,
    replaceResult
  ] = useFetchProjections(wellId);

  const projectionsData = useMemo(
    () =>
      projections.map((p, i) => {
        return {
          ...p,
          pos: p.pos || p.tcl - p.tvd,
          name: `PA${i + 1}`,
          isProjection: true,
          color: 0xee2211,
          selectedColor: 0xee2211,
          alpha: 0.5,
          selectedAlpha: 1
        };
      }),
    [projections]
  );

  return { projectionsData, updateProjection, refreshProjections, deleteProjection, addProjection, replaceResult };
}

function useFormationsData() {
  const { wellId } = useWellIdContainer();

  const [serverFormations, isLoading, , , , { refresh }] = useFetchFormations(wellId);

  const computedFormations = useComputedFormations(serverFormations);

  return { serverFormations, formationsData: computedFormations, refreshFormations: refresh, isLoading };
}

export function useCrossSectionData() {
  const { surveys, wellPlan, formations, projections } = useComputedFilteredWellData();
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);

  const [{ selectionById: selectedSections }] = useComboContainer();
  const { toggleSegmentSelection, deselectAll } = useSelectionActions();

  const addProjection = useAddProjection();
  const deleteProjection = useDeleteProjection();

  return {
    addProjection,
    deleteProjection,
    wellPlan,
    selectedSections,
    toggleSegmentSelection,
    deselectAll,
    calcSections: rawSections,
    calculatedFormations: formations
  };
}

function useSelectedWellInfo() {
  const { wellId } = useWellIdContainer();
  return useWellInfo(wellId);
}

function useSelectedLogDataScale(initialState) {
  const [selectedLogs, setSelectedLog] = useReducer(selectedLogReducer, initialState);

  return { selectedLogs, setSelectedLog };
}

// Create containers
export const {
  Provider: CloudServerCountdownProvider,
  useContainer: useCloudServerCountdownContainer
} = createContainer(useCloudServerCountdown);
export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(useTimeSlider);
export const { Provider: DrillPhaseProvider, useContainer: useDrillPhaseContainer } = createContainer(useDrillPhase);
export const { Provider: AppStateProvider, useContainer: useAppState } = createContainer(useAppStateData);
export const { Provider: WellIdProvider, useContainer: useWellIdContainer } = createContainer(useWellId);
export const { Provider: FormationsProvider, useContainer: useFormationsDataContainer } = createContainer(
  useFormationsData
);
export const { Provider: SurveysProvider, useContainer: useSurveysDataContainer } = createContainer(useSurveysData);
export const { Provider: WellPlanProvider, useContainer: useWellPlanDataContainer } = createContainer(useWellPlanData);
export const { Provider: ControlLogProvider, useContainer: useControlLogDataContainer } = createContainer(
  useControlLogListData
);
export const { Provider: ProjectionsProvider, useContainer: useProjectionsDataContainer } = createContainer(
  useProjectionsData
);
export const { Provider: CrossSectionProvider, useContainer: useCrossSectionContainer } = createContainer(
  useCrossSectionData
);

export const { Provider: SelectedWellInfoProvider, useContainer: useSelectedWellInfoContainer } = createContainer(
  useSelectedWellInfo
);
export const {
  Provider: SelectedLogDataScaleProvider,
  useContainer: useSelectedLogDataScaleContainer
} = createContainer(useSelectedLogDataScale);
