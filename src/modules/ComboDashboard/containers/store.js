import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  draftMode: false
};

function comboStoreReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_MD": {
      if (state.selectedMd === action.md) {
        return {
          ...state,
          selectedMd: null
        };
      } else {
        return {
          ...state,
          selectedMd: action.md
        };
      }
    }
    case "TOGGLE_DRAFT_MODE":
      const draft = !state.draftMode;
      const selectedMd = state.selectedMd;
      // reset pending state for drafted item
      const pendingSegmentsState = {
        ...state.pendingSegmentsState,
        [selectedMd]: {}
      };

      return {
        ...state,
        draftMode: draft,
        pendingSegmentsState
      };
    case "UPDATE_SEGMENT_PROPERTIES":
      return {
        ...state,
        pendingSegmentsState: {
          ...state.pendingSegmentsState,
          [action.md]: {
            ...(state.pendingSegmentsState[action.md] || {}),
            ...action.props
          }
        }
      };
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
