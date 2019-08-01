import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { createContainer } from "unstated-next";

import memoize from "react-powertools/memoize";

import {
  useAdditionalDataLog,
  useFetchFormations,
  useFetchProjections,
  useFetchSurveys,
  useWellOverviewKPI,
  useWellPath
} from "../../api";
import { drillPhaseReducer, PADeltaInit, PADeltaReducer } from "./reducers";
import usePrevious from "react-use/lib/usePrevious";
import { DIP_END, FAULT_END, INIT, PA_END, TAG_END } from "../../constants/interactivePAStatus";
import { DIP_FAULT_POS_VS, TVD_VS } from "../../constants/calcMethods";
import { useComboContainer } from "../ComboDashboard/containers/store";
import { useComputedFormations } from "../Interpretation/selectors";

const filterDataToInterval = memoize((data, interval) => {
  if (data && data.length) {
    return data.filter(({ md }) => interval.firstDepth <= md && md <= interval.lastDepth);
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
  const {
    projectionsData,
    saveProjections,
    refreshProjections,
    deleteProjection,
    addProjection
  } = useProjectionsDataContainer();
  const wellPlan = useWellPath(wellId);

  // Filter data and memoize
  const wellPlanFiltered = filterDataToInterval(wellPlan, sliderInterval);
  const surveysFiltered = filterDataToInterval(surveysData, sliderInterval);
  const projectionsFiltered = filterDataToInterval(projectionsData, sliderInterval);
  const formationsFiltered = formationsData.map(f => {
    return {
      ...f,
      data: filterDataToInterval(f.data, sliderInterval)
    };
  });

  // TODO: Remove this update method when implementing entity versions
  //  (FE should perform same action as BE without the need to update)
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
  // TODO: Remove this update method when implementing entity versions
  //  (FE should perform same action as BE without the need to update)
  const deleteAndUpdate = useCallback(
    (...args) => {
      deleteProjection(...args).then((data, err) => {
        if (!err) {
          refreshFormations();
          refreshProjections();
        }
      });
    },
    [deleteProjection, refreshProjections, refreshFormations]
  );

  return {
    addProjection,
    surveys: surveysFiltered,
    wellPlan,
    wellPlanFiltered,
    formations: formationsFiltered,
    projections: projectionsFiltered,
    saveProjection: saveAndUpdate,
    deleteProjection: deleteAndUpdate
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
    ...filterDataToLast(data, sliderInterval.lastDepth)
  };
}

// Organize well sections into array of objects
export function useWellSections(wellId) {
  const { data } = useWellOverviewKPI(wellId);
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

  const [surveys, { updateSurvey }] = useFetchSurveys(wellId);

  useEffect(() => {
    // TODO Check timestamp or something to determine if we should update with server data
    if (surveys && surveys.length) {
      setSurveys(surveys);
    }
  }, [surveys, setSurveys]);

  return { surveysData, setSurveys, updateSurvey, surveys };
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

  const [projections, refreshProjections, saveProjections, deleteProjection, addProjection] = useFetchProjections(
    wellId
  );

  useEffect(() => {
    // TODO Check timestamp or something to determine if we should update with server data
    if (projections && projections.length) {
      projectionsDispatch({
        type: "serverReset",
        data: projections
      });
    }
  }, [projections]);

  return { projectionsData, projectionsDispatch, saveProjections, refreshProjections, deleteProjection, addProjection };
}

function useFormationsData() {
  const { wellId } = useWellIdContainer();

  const [serverFormations, refreshFormations] = useFetchFormations(wellId);

  const computedFormations = useComputedFormations(serverFormations);

  return { formationsData: computedFormations, refreshFormations };
}

export function useCrossSectionData() {
  const { surveys, wellPlan, formations, projections, saveProjection, addProjection } = useFilteredWellData();
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const [ghostDiff, ghostDiffDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const [{ selectedMd }, , { setSelectedMd, deselectMd }] = useComboContainer();

  const selectedSections = useMemo(
    function getSelectedSections() {
      const selected = rawSections.find((s, index) => {
        return s.md === selectedMd;
      });
      return selected ? { [selected.id]: true } : {};
    },
    [selectedMd, rawSections]
  );

  const prevStatus = usePrevious(ghostDiff.status);
  useEffect(() => {
    const { status, op, prevOp } = ghostDiff;
    const pos = op.tcl + ghostDiff.tcl - (op.tvd + ghostDiff.tvd);
    if (prevStatus !== status) {
      switch (status) {
        case DIP_END:
          saveProjection(op.id, DIP_FAULT_POS_VS, { dip: op.dip - ghostDiff.dip, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
        case FAULT_END:
          saveProjection(prevOp.id, DIP_FAULT_POS_VS, { fault: prevOp.fault + ghostDiff.prevFault });
          break;
        case PA_END:
          saveProjection(op.id, TVD_VS, { tvd: op.tvd + ghostDiff.tvd, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
        case TAG_END:
          saveProjection(op.id, DIP_FAULT_POS_VS, { dip: op.dip + ghostDiff.dip, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
      }
    }
  }, [ghostDiff, prevStatus, saveProjection]);

  const calcSections = useMemo(() => {
    const index = rawSections.findIndex(p => p.id === ghostDiff.id);
    if (index === -1) {
      return rawSections;
    }
    return rawSections.map((p, i) => {
      if (i === index - 1) {
        return {
          ...p,
          tot: p.tot + ghostDiff.prevFault,
          bot: p.bot + ghostDiff.prevFault,
          tcl: p.tcl + ghostDiff.prevFault,
          fault: p.fault + ghostDiff.prevFault
        };
      } else if (i === index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tvd + ghostDiff.prevFault,
          vs: p.vs + ghostDiff.vs,
          tot: p.tot + ghostDiff.tot + ghostDiff.prevFault,
          bot: p.bot + ghostDiff.bot + ghostDiff.prevFault,
          tcl: p.tcl + ghostDiff.tcl + ghostDiff.prevFault
        };
      } else if (i > index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tot + ghostDiff.prevFault
        };
      } else {
        return p;
      }
    });
  }, [rawSections, ghostDiff]);

  const calculatedFormations = useMemo(() => {
    const index = calcSections.findIndex(p => p.id === ghostDiff.id);

    return formations.map(layer => {
      return {
        ...layer,
        data: layer.data.map((point, j) => {
          if (j === index) {
            return {
              ...point,
              vs: point.vs + ghostDiff.vs,
              fault: point.fault + ghostDiff.prevFault,
              tot: point.tot + ghostDiff.tot + ghostDiff.prevFault
            };
          } else if (j > index) {
            return {
              ...point,
              tot: point.tot + ghostDiff.tot + ghostDiff.prevFault
            };
          }
          return point;
        })
      };
    });
  }, [formations, ghostDiff, calcSections]);

  useEffect(() => {
    const id = Object.keys(selectedSections)[0];
    const index = rawSections.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      ghostDiffDispatch({
        type: INIT,
        prevSection: rawSections[index - 1],
        section: rawSections[index],
        nextSection: rawSections[index + 1]
      });
    }
  }, [selectedSections, rawSections]);
  return {
    addProjection,
    wellPlan,
    selectedSections,
    setSelectedMd,
    deselectMd,
    selectedMd,
    ghostDiff,
    ghostDiffDispatch,
    calcSections,
    calculatedFormations
  };
}

// Create containers

export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(useTimeSlider);
export const { Provider: DrillPhaseProvider, useContainer: useDrillPhaseContainer } = createContainer(useDrillPhase);
export const { Provider: AppStateProvider, useContainer: useAppState } = createContainer(useAppStateData);
export const { Provider: WellIdProvider, useContainer: useWellIdContainer } = createContainer(useWellId);
// TODO: Reduce number of providers (formations, surveys, projections may not be needed)
export const { Provider: FormationsProvider, useContainer: useFormationsDataContainer } = createContainer(
  useFormationsData
);
export const { Provider: SurveysProvider, useContainer: useSurveysDataContainer } = createContainer(useSurveysData);
export const { Provider: ProjectionsProvider, useContainer: useProjectionsDataContainer } = createContainer(
  useProjectionsData
);
export const { Provider: CrossSectionProvider, useContainer: useCrossSectionContainer } = createContainer(
  useCrossSectionData
);
