import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";
import { useWellLogsContainer } from "./wellLogs";

import { getPendingSegments } from "../../Interpretation/selectors";
import mapValues from "lodash/mapValues";
import reduce from "lodash/reduce";

export const surveyVisibility = {
  ALL: "all",
  CURRENT: "current",
  PREVIOUS_MD: "previousMd"
};

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  nrPrevSurveysToDraft: 2,
  draftMode: false,
  surveyVisibility: surveyVisibility.ALL,
  surveyPrevVisibility: 500
};

const initialPendingState = {};

function selectedMdReducer(selectedMd, action) {
  switch (action.type) {
    case "TOGGLE_MD": {
      if (selectedMd === action.md) {
        return null;
      }

      return action.md;
    }
    case "DESELECT_ALL":
      return null;
    default:
      return selectedMd;
  }
}

function updatePendingSegments(pendingSegmentsState, state, logs, action) {
  const { selectedMd, nrPrevSurveysToDraft, draftMode } = state;
  const pendingSegments = getPendingSegments(selectedMd, logs, nrPrevSurveysToDraft, draftMode);
  return pendingSegments.reduce((acc, segment) => {
    return {
      ...acc,
      [segment.endmd]: pendingSegmentState(acc[segment.endmd], action, segment.endmd)
    };
  }, pendingSegmentsState);
}

function pendingSegmentState(pendingState, action, key) {
  switch (action.type) {
    case "TOGGLE_DRAFT_MODE": {
      return { ...initialPendingState };
    }
    case "UPDATE_SEGMENTS_PROPERTIES": {
      const segmentProps = action.propsByMd[key];
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
    case "TOGGLE_MD": {
      if (state.selectedMd !== action.md) {
        return state.draftMode ? {} : pendingSegmentsState;
      }

      return pendingSegmentsState;
    }
    case "TOGGLE_DRAFT_MODE": {
      return mapValues(pendingSegmentsState, (pendingState, md) => pendingSegmentState(pendingState, action, md));
    }
    case "UPDATE_SEGMENTS_PROPERTIES":
      return reduce(
        action.propsByMd,
        (acc, newProps, md) => {
          return {
            ...acc,
            [md]: pendingSegmentState(acc[md], action, md)
          };
        },
        pendingSegmentsState
      );

    case "CHANGE_SELECTED_SEGMENT_BIAS":
    case "CHANGE_SELECTED_SEGMENT_SCALE":
      return updatePendingSegments(pendingSegmentsState, state, logs, action);

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

function nrPrevSurveysToDraftReduce(nrPrevSurveysToDraft, action) {
  switch (action.type) {
    case "CHANGE_PREV_SURVEYS_DRAFT": {
      return action.nrSurveys;
    }
    default:
      return nrPrevSurveysToDraft;
  }
}

const comboStoreReducer = logs => (state, action) => {
  return {
    ...state,
    selectedMd: selectedMdReducer(state.selectedMd, action),
    pendingSegmentsState: pendingSegmentsStateReducer(state.pendingSegmentsState, action, state, logs),
    draftMode: draftModeReducer(state.draftMode, action),
    surveyVisibility: surveyVisibilityReducer(state.surveyVisibility, action),
    surveyPrevVisibility: surveyPrevVisibilityReducer(state.surveyPrevVisibility, action),
    nrPrevSurveysToDraft: nrPrevSurveysToDraftReduce(state.nrPrevSurveysToDraft, action)
  };
};

function useUseComboStore() {
  const [logs] = useWellLogsContainer();
  const reducer = useCallback(comboStoreReducer(logs), [logs]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const setSelectedMd = useCallback(md => dispatch({ type: "TOGGLE_MD", md }), [dispatch]);
  const deselectMd = useCallback(() => dispatch({ type: "DESELECT_ALL" }), [dispatch]);
  const updateSegments = useCallback(propsByMd => dispatch({ type: "UPDATE_SEGMENTS_PROPERTIES", propsByMd }), [
    dispatch
  ]);

  return [state, dispatch, { setSelectedMd, updateSegments, deselectMd }];
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
