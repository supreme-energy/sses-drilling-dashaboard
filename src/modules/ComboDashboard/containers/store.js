import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  draftMode: false
};

const initialPendingState = {
  scale: 1,
  bias: 0
};

function updateSegmentProperties(state, md, p) {
  return {
    ...state,
    pendingSegmentsState: {
      ...state.pendingSegmentsState,
      [md]: {
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
        const pendingSegmentsState = {
          ...state.pendingSegmentsState,
          [action.md]: initialPendingState
        };
        return {
          ...state,
          selectedMd: action.md,
          pendingSegmentsState
        };
      }
    }
    case "TOGGLE_DRAFT_MODE":
      const draft = !state.draftMode;

      return {
        ...state,
        draftMode: draft
      };
    case "UPDATE_SEGMENT_PROPERTIES":
      return updateSegmentProperties(state, action.md, action.props);
    case "CHANGE_SELECTED_SEGMENT_BIAS_DELTA": {
      const selectedMd = state.selectedMd;
      const selectionPendingState = state.pendingSegmentsState[selectedMd] || initialPendingState;
      return updateSegmentProperties(state, selectedMd, { bias: (selectionPendingState.bias || 0) + action.delta });
    }

    case "CHANGE_SELECTED_SEGMENT_BIAS": {
      const selectedMd = state.selectedMd;

      return updateSegmentProperties(state, selectedMd, { bias: action.bias });
    }

    case "CHANGE_SELECTED_SEGMENT_SCALE": {
      const selectedMd = state.selectedMd;
      return updateSegmentProperties(state, selectedMd, { scale: action.scale });
    }
    default:
      throw new Error("action not defined for combo store reducer");
  }
}

function useUseComboStore() {
  const [state, dispatch] = useReducer(comboStoreReducer, initialState);
  const setSelectedMd = useCallback(md => dispatch({ type: "TOGGLE_MD", md }), [dispatch]);
  const updateSegment = useCallback((props, md) => dispatch({ type: "UPDATE_SEGMENT_PROPERTIES", md, props }), [
    dispatch
  ]);

  return [state, dispatch, { setSelectedMd, updateSegment }];
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
