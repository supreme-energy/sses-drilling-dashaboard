import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";
import { useProjectionsDataContainer, useFormationsDataContainer } from "../../App/Containers";

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {},
  draftMode: false,
  pendingProjectionsByMD: {}
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

    case "DESELECT_ALL":
      return {
        ...state,
        selectedMd: null
      };

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
    case "ADD_PENDING_PROJECTION": {
      return {
        ...state,
        pendingProjectionsByMD: {
          ...state.pendingProjectionsByMD,
          [action.projection.md]: action.projection
        }
      };
    }
    case "RESET_PENDING_PROJECTION": {
      const pendingProjectionsByMD = { ...state.pendingProjectionsByMD };
      delete pendingProjectionsByMD[action.projection.md];
      return {
        ...state,
        pendingProjectionsByMD
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

export function useAddProjection() {
  const [state, dispatch] = useUseComboStore();
  const addProjection = useCallback(projection => dispatch({ type: "ADD_PENDING_PROJECTION", projection }), [dispatch]);
  const resetPendingProjection = useCallback(projection => dispatch({ type: "RESET_PENDING_PROJECTION", projection }), [
    dispatch
  ]);
  const { addProjection: saveProjection } = useProjectionsDataContainer();
  console.log("pending", state.pendingProjectionsByMD);
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
