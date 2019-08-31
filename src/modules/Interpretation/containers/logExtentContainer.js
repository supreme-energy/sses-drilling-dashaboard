import { createContainer } from "unstated-next";
import React, { useRef, useEffect, useReducer, useCallback } from "react";
import { usePendingSegments, getSelectedId, useLogExtent } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";

// this is more a workaround for hooks looping limitation, useLogExtent working with only one log
// todo: better solution to this: accumulte extents into fetch client for log line data
export default function LogExtent({ log, wellId, updateExtent, currentSelection, draftMode }) {
  const extent = useLogExtent(log, wellId);

  useEffect(() => {
    if (extent) {
      updateExtent({ log, extent });
    }
  }, [updateExtent, extent, currentSelection, log, draftMode]);
  return null;
}

export const LogsExtentList = ({ wellId }) => {
  const [, , { resetExtent, updateExtent }] = useLogExtentContainer();
  const pendingSegments = usePendingSegments();
  const internalStateRef = useRef({ prevSelection: null, prevDraftMode: false });
  const [{ selectionById, draftMode }] = useComboContainer();
  const currentSelection = getSelectedId(selectionById);
  if (
    currentSelection !== internalStateRef.current.prevSelection ||
    draftMode !== internalStateRef.current.prevDraftMode
  ) {
    resetExtent();
    internalStateRef.current.prevSelection = currentSelection;
    internalStateRef.current.prevDraftMode = draftMode;
  }
  return (
    <React.Fragment>
      {pendingSegments.map(s => (
        <LogExtent
          log={s}
          key={s.id}
          updateExtent={updateExtent}
          wellId={wellId}
          currentSelection={currentSelection}
          draftMode={draftMode}
        />
      ))}
    </React.Fragment>
  );
};

const initialState = {
  selectionExtent: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  selectionExtentWithBiasAndScale: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
};
function extentReducer(state, action) {
  switch (action.type) {
    case "UPDATE_EXTENT":
      const [min, max] = action.extent;
      const bias = Number(action.log.scalebias);
      const scale = Number(action.log.scalefactor);
      return {
        ...state,
        selectionExtent: [Math.min(state.selectionExtent[0], min), Math.max(state.selectionExtent[1], max)],
        selectionExtentWithBiasAndScale: [
          Math.min(state.selectionExtentWithBiasAndScale[0], min / 2 - (min * scale) / 2 + bias),
          Math.max(state.selectionExtentWithBiasAndScale[1], max / 2 + (max * scale) / 2 + bias)
        ]
      };
    case "RESET":
      return { ...initialState };
    default:
      throw new Error("action not supported");
  }
}

function useCalculateLogExtent() {
  const [state, dispatch] = useReducer(extentReducer, initialState);
  const updateExtent = useCallback(
    ({ log, extent }) =>
      dispatch({
        type: "UPDATE_EXTENT",
        log,
        extent
      }),
    [dispatch]
  );

  const resetExtent = useCallback(
    () =>
      dispatch({
        type: "RESET"
      }),
    [dispatch]
  );
  return [state, dispatch, { updateExtent, resetExtent }];
}

export const { Provider: LogExtentProvider, useContainer: useLogExtentContainer } = createContainer(
  useCalculateLogExtent
);
