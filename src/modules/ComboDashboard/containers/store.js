import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";

export const surveyVisibility = {
  ALL: "all",
  CURRENT: "current",
  PREVIOUS_MD: "previousMd"
};

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  draftMode: false,
  surveyVisibility: surveyVisibility.ALL,
  surveyPrevVisibility: 500
};

const initialPendingState = {};

function updateSegmentProperties(state, md, p, reset) {
  return {
    ...state,
    pendingSegmentsState: {
      ...state.pendingSegmentsState,
      [md]: reset
        ? initialPendingState
        : {
            ...(state.pendingSegmentsState[md] || initialPendingState),
            ...p
          }
    }
  };
}

function comboStoreReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_MD": {
      if (state.selectedMd === action.md) {
        return {
          ...state,
          selectedMd: null
        };
      } else {
        const prevSelectedMd = state.selectedMd;
        const pendingSegmentsState = {
          ...state.pendingSegmentsState,
          [action.md]: initialPendingState
        };

        if (prevSelectedMd) {
          pendingSegmentsState[prevSelectedMd] = initialPendingState;
        }

        return {
          ...state,
          selectedMd: action.md,
          pendingSegmentsState
        };
      }
    }
    case "DESELECT_ALL":
      return {
        ...state,
        selectedMd: null
      };
    case "TOGGLE_DRAFT_MODE":
      const draft = !state.draftMode;
      const selectedMd = state.selectedMd;
      return updateSegmentProperties(
        {
          ...state,
          draftMode: draft
        },
        selectedMd,
        {},
        true
      );

    case "UPDATE_SEGMENT_PROPERTIES":
      return updateSegmentProperties(state, action.md, action.props);
    case "RESET_SEGMENT_PENDING_STATE":
      return updateSegmentProperties(state, action.md, {}, true);

    case "CHANGE_SELECTED_SEGMENT_BIAS": {
      const selectedMd = state.selectedMd;

      return updateSegmentProperties(state, selectedMd, { bias: action.bias });
    }

    case "CHANGE_SELECTED_SEGMENT_SCALE": {
      const selectedMd = state.selectedMd;
      const props = { scale: action.scale };
      if (action.bias !== undefined) {
        props.bias = action.bias;
      }

      return updateSegmentProperties(state, selectedMd, props);
    }
    case "CHANGE_INTERPRETATION_SURVEY_VISIBILITY": {
      return {
        ...state,
        surveyVisibility: action.surveyVisibility
      };
    }

    case "CHANGE_INTERPRETATION_SURVEY_PREV_VISIBILITY": {
      return {
        ...state,
        surveyPrevVisibility: action.surveyPrevVisibility
      };
    }
    default:
      throw new Error("action not defined for combo store reducer");
  }
}

function useUseComboStore() {
  const [state, dispatch] = useReducer(comboStoreReducer, initialState);
  const setSelectedMd = useCallback(md => dispatch({ type: "TOGGLE_MD", md }), [dispatch]);
  const deselectMd = useCallback(() => dispatch({ type: "DESELECT_ALL" }), [dispatch]);
  const updateSegment = useCallback((props, md) => dispatch({ type: "UPDATE_SEGMENT_PROPERTIES", md, props }), [
    dispatch
  ]);

  return [state, dispatch, { setSelectedMd, updateSegment, deselectMd }];
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
