import { createContainer } from "unstated-next";
import { useCallback } from "react";

import mapValues from "lodash/mapValues";
import reduce from "lodash/reduce";
import { useProjectionsDataContainer, useFormationsDataContainer, useWellIdContainer } from "../../App/Containers";
import { useLocalStorageReducer } from "react-storage-hooks";

export const surveyVisibility = {
  ALL: "all",
  CURRENT: "current",
  PREVIOUS_MD: "previousMd"
};

const initialState = {
  selectionById: {},
  // falsy | Number:  this is changed each time we need to adjust viewport to ensure last selected item is in viewport
  resetViewportCounter: 0,
  pendingSegmentsState: {},
  logsBiasAndScale: {},
  currentEditedLog: null,
  nrPrevSurveysToDraft: 2,
  draftMode: false,
  surveyVisibility: surveyVisibility.ALL,
  surveyPrevVisibility: 500,
  colorsByWellLog: {
    wellLogs: "275196"
  }
};

const initialPendingState = {};

function selectionByIdReducer(selectionById, action) {
  switch (action.type) {
    case "CHANGE_SELECTION": {
      if (!selectionById[action.id]) {
        return {
          [action.id]: true
        };
      }

      return selectionById;
    }
    case "DESELECT_ALL":
      return {};
    default:
      return selectionById;
  }
}

function resetViewportCounterReducer(resetViewportCounter, action) {
  switch (action.type) {
    case "CHANGE_SELECTION": {
      if (action.ensureSelectionInViewport) {
        return Date.now();
      }
      return 0;
    }
    case "RESET_VIEWPORT_COUNTER":
      return Date.now();
    default:
      return resetViewportCounter;
  }
}

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

function pendingSegmentsStateReducer(stateSlice, action, state) {
  switch (action.type) {
    case "TOGGLE_SELECTION": {
      const resetPendingState = state.draftMode && state.selectionById[action.id];
      return resetPendingState ? {} : stateSlice;
    }
    case "TOGGLE_DRAFT_MODE": {
      // reset pending segments state to initialPendingState
      return mapValues(stateSlice, (pendingState, md) => pendingSegmentState(pendingState, action, md));
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
        stateSlice
      );
    case "RESET_SEGMENTS_PROPERTIES":
      return reduce(
        action.propsById,
        (acc, newProps, id) => {
          return {
            ...acc,
            [id]: initialPendingState
          };
        },
        stateSlice
      );

    default:
      return stateSlice;
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

function currentEditedLogReducer(currentEditedLog, action) {
  switch (action.type) {
    case "CHANGE_CURRENT_EDITED_LOG": {
      return action.logId;
    }
    default:
      return currentEditedLog;
  }
}

export const initialLogBiasAndScale = {
  bias: 1,
  scale: 1
};

function logBiasAndScale(biasAndScale, action) {
  switch (action.type) {
    case "UPDATE_LOG_BIAS_AND_SCALE": {
      const currentBiasAndScale = biasAndScale || initialLogBiasAndScale;
      return {
        ...currentBiasAndScale,
        bias: action.bias !== undefined ? action.bias : currentBiasAndScale.bias,
        scale: action.scale !== undefined ? action.scale : currentBiasAndScale.scale
      };
    }
    case "RESET_LOG_BIAS_AND_SCALE": {
      return null;
    }
    default:
      return biasAndScale;
  }
}

function logsBiasAndScaleReducer(logsBiasAndScale, action) {
  switch (action.type) {
    case "CHANGE_CURRENT_EDITED_LOG":
    case "UPDATE_LOG_BIAS_AND_SCALE":
    case "RESET_LOG_BIAS_AND_SCALE": {
      if (!action.logId) {
        return logsBiasAndScale;
      }
      return {
        ...logsBiasAndScale,
        [action.logId]: logBiasAndScale(logsBiasAndScale[action.logId], action)
      };
    }

    default:
      return logsBiasAndScale;
  }
}

function colorsByWellLogReducer(colorsByWellLog, action) {
  switch (action.type) {
    case "CHANGE_LOG_COLOR":
      return {
        ...colorsByWellLog,
        [action.logId]: action.color
      };
    default:
      return colorsByWellLog;
  }
}

const comboStoreReducer = (state, action) => {
  return {
    ...state,
    selectionById: selectionByIdReducer(state.selectionById, action),
    resetViewportCounter: resetViewportCounterReducer(state.resetViewportCounter, action),
    pendingSegmentsState: pendingSegmentsStateReducer(state.pendingSegmentsState, action, state),
    draftMode: draftModeReducer(state.draftMode, action),
    surveyVisibility: surveyVisibilityReducer(state.surveyVisibility, action),
    surveyPrevVisibility: surveyPrevVisibilityReducer(state.surveyPrevVisibility, action),
    nrPrevSurveysToDraft: nrPrevSurveysToDraftReducer(state.nrPrevSurveysToDraft, action),
    currentEditedLog: currentEditedLogReducer(state.currentEditedLog, action),
    logsBiasAndScale: logsBiasAndScaleReducer(state.logsBiasAndScale, action),
    colorsByWellLog: colorsByWellLogReducer(state.colorsByWellLog, action)
  };
};

const initializer = savedState => {
  // only save selection
  return { ...initialState, selectionById: savedState.selectionById };
};

function useUseComboStore() {
  const { wellId } = useWellIdContainer();
  const [state, dispatch] = useLocalStorageReducer(
    `${wellId}-combo-store`,
    comboStoreReducer,
    initialState,
    initializer
  );

  return [state, dispatch];
}

export function useAddProjection() {
  const { addProjection } = useProjectionsDataContainer();
  const { refreshFormations } = useFormationsDataContainer();

  return useCallback(
    projection => {
      return addProjection(projection).then(refreshFormations);
    },
    [addProjection, refreshFormations]
  );
}

export function useDeleteProjection() {
  const { deleteProjection } = useProjectionsDataContainer();
  const { refreshFormations } = useFormationsDataContainer();

  return useCallback(
    projection => {
      return deleteProjection(projection).then(refreshFormations);
    },
    [deleteProjection, refreshFormations]
  );
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
