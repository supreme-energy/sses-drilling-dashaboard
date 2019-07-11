import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";
import { useWellLogList } from "../../../api";

const initialState = {
  selectedMd: null,
  pendingSegmentsState: {}
};

function comboStoreReducer(state, action) {
  switch (action.type) {
    case "SELECT_MD":
      return {
        ...state,
        selectedMd: action.md
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
  const { selectedMd, pendingSegmentsState } = state;
  const selectMd = useCallback(md => dispatch({ type: "SELECT_MD", md }), [dispatch]);
  const updateSegment = useCallback((props, md) => dispatch({ type: "UPDATE_SEGMENT_PROPERTIES", md, props }), [
    dispatch
  ]);

  const [, logsById] = useWellLogList();

  const onEndSegmentDrag = useCallback(
    (newPosition, segment) => {
      const pendingState = pendingSegmentsState[segment.startmd];

      const depth = newPosition.y;
      //const newDip = calculateDip({ tvd: segment.endtvd, depth: depth, vs: segment.endvs });
      //updateSegment({ dip: newDip }, segment.startmd);
    },
    [pendingSegmentsState, updateSegment]
  );

  // const onStartSegmentLabelDrag = useCallback(
  //   event => {
  //     const newPosition = event.data.getLocalPosition(viewport);

  //     const fault = segment.startdepth - newPosition.y;
  //     let dip = calculateDip({ tvd: segment.endtvd, depth: segment.enddepth + fault, vs: segment.endvs });

  //     updateSegment({ fault }, selectedMd);
  //   },
  //   [segment, selectedMd, updateSegment, viewport, calculateDip]
  // );

  return [state, dispatch, { selectMd, updateSegment, onEndSegmentDrag }];
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
