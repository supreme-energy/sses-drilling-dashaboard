import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";
import { useWellLogsContainer } from "./wellLogs";

import { getPendingSegments } from "../../Interpretation/selectors";
import mapValues from "lodash/mapValues";
import reduce from "lodash/reduce";
import { useProjectionsDataContainer, useFormationsDataContainer } from "../../App/Containers";

export const surveyVisibility = {
  ALL: "all",
  CURRENT: "current",
  PREVIOUS_MD: "previousMd"
};

const initialState = {
  selectionById: {},
  pendingSegmentsState: {},
  nrPrevSurveysToDraft: 2,
  draftMode: false,
  surveyVisibility: surveyVisibility.ALL,
  surveyPrevVisibility: 500,
  pendingProjectionsByMd: {}
};

const initialPendingState = {};

function selectionByIdReducer(selectionById, action) {
  switch (action.type) {
    case "TOGGLE_SELECTION": {
      if (selectionById[action.id]) {
        const newSelection = {
          ...selectionById
        };
        delete newSelection[action.id];
        return newSelection;
      }
      return {
        [action.id]: true
      };
    }
    case "DESELECT_ALL":
      return {};
    default:
      return selectionById;
  }
}

// function updatePendingSegments(pendingSegmentsState, state, logs, action) {
//   const { selectionById, nrPrevSurveysToDraft, draftMode } = state;
//   const selectedMd =
//   const pendingSegments = getPendingSegments(selectedMd, logs, nrPrevSurveysToDraft, draftMode);
//   return pendingSegments.reduce((acc, segment) => {
//     return {
//       ...acc,
//       [segment.endmd]: pendingSegmentState(acc[segment.endmd], action, segment.endmd)
//     };
//   }, pendingSegmentsState);
// }

function pendingSegmentState(pendingState, action, key) {
  switch (action.type) {
    case "TOGGLE_DRAFT_MODE": {
      return { ...initialPendingState };
    }
    case "UPDATE_SEGMENTS_PROPERTIES": {
      const segmentProps = action.propsById[key];
      return { ...(pendingState || initialPendingState), ...segmentProps };
    }
    case "CHANGE_SELECTED_SEGMENT_BIAS": {
      return {
        ...pendingState,
        bias: action.bias
      };
    }
    case "CHANGE_SELECTED_SEGMENT_SCALE": {
      const newState = {
        ...pendingState,
        scale: action.scale
      };

      if (action.bias !== undefined) {
        newState.bias = action.bias;
      }

      return newState;
    }
    default:
      return pendingState;
  }
}

function pendingSegmentsStateReducer(pendingSegmentsState, action, state, logs) {
  switch (action.type) {
    case "TOGGLE_SELECTION": {
      const resetPendingState = state.draftMode && state.selectionById[action.id];
      return resetPendingState ? {} : pendingSegmentState;
    }
    case "TOGGLE_DRAFT_MODE": {
      // reset pending segments state to initialPendingState
      return mapValues(pendingSegmentsState, (pendingState, md) => pendingSegmentState(pendingState, action, md));
    }
    case "UPDATE_SEGMENTS_PROPERTIES":
      return reduce(
        action.propsById,
        (acc, newProps, id) => {
          return {
            ...acc,
            [id]: pendingSegmentState(acc[id], action, id)
          };
        },
        pendingSegmentsState
      );

    // case "CHANGE_SELECTED_SEGMENT_BIAS":
    // case "CHANGE_SELECTED_SEGMENT_SCALE":
    //   return updatePendingSegments(pendingSegmentsState, state, logs, action);

    default:
      return pendingSegmentsState;
  }
}

function draftModeReducer(draftMode, action) {
  switch (action.type) {
    case "TOGGLE_DRAFT_MODE":
      return !draftMode;
    default:
      return draftMode;
  }
}

function surveyVisibilityReducer(visibility, action) {
  switch (action.type) {
    case "CHANGE_INTERPRETATION_SURVEY_VISIBILITY": {
      return action.surveyVisibility;
    }
    default:
      return visibility;
  }
}

function surveyPrevVisibilityReducer(prevVisibility, action) {
  switch (action.type) {
    case "CHANGE_INTERPRETATION_SURVEY_PREV_VISIBILITY": {
      return action.surveyPrevVisibility;
    }
    default:
      return prevVisibility;
  }
}

function nrPrevSurveysToDraftReducer(nrPrevSurveysToDraft, action) {
  switch (action.type) {
    case "CHANGE_PREV_SURVEYS_DRAFT": {
      return action.nrSurveys;
    }
    default:
      return nrPrevSurveysToDraft;
  }
}

function pendingProjectionsByMdReducer(pendingProjectionsByMd, action) {
  switch (action.type) {
    case "ADD_PENDING_PROJECTION": {
      return {
        ...pendingProjectionsByMd,
        [action.projection.md]: action.projection
      };
    }
    case "RESET_PENDING_PROJECTION": {
      const newState = { ...pendingProjectionsByMd };
      delete newState[action.projection.md];
      return newState;
    }
  }
}

const comboStoreReducer = logs => (state, action) => {
  return {
    ...state,
    selectionById: selectionByIdReducer(state.selectionById, action),
    pendingSegmentsState: pendingSegmentsStateReducer(state.pendingSegmentsState, action, state, logs),
    draftMode: draftModeReducer(state.draftMode, action),
    surveyVisibility: surveyVisibilityReducer(state.surveyVisibility, action),
    surveyPrevVisibility: surveyPrevVisibilityReducer(state.surveyPrevVisibility, action),
    nrPrevSurveysToDraft: nrPrevSurveysToDraftReducer(state.nrPrevSurveysToDraft, action),
    pendingProjectionsByMd: pendingProjectionsByMdReducer(state.pendingProjectionsByMd, action)
  };
};

function useUseComboStore() {
  const [logs] = useWellLogsContainer();

  const reducer = useCallback(comboStoreReducer(logs), [logs]);
  const [state, dispatch] = useReducer(reducer, initialState);

  return [state, dispatch];
}

export function useAddProjection() {
  const [, dispatch] = useUseComboStore();
  const addProjection = useCallback(projection => dispatch({ type: "ADD_PENDING_PROJECTION", projection }), [dispatch]);
  const resetPendingProjection = useCallback(projection => dispatch({ type: "RESET_PENDING_PROJECTION", projection }), [
    dispatch
  ]);
  const { addProjection: saveProjection } = useProjectionsDataContainer();
  const { refreshFormations } = useFormationsDataContainer();

  return useCallback(
    projection => {
      addProjection(projection);
      saveProjection(projection)
        .then(refreshFormations)
        .then(() => resetPendingProjection(projection));
    },
    [addProjection, saveProjection, resetPendingProjection, refreshFormations]
  );
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
