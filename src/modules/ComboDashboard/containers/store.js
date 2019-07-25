import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  draftMode: false
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
