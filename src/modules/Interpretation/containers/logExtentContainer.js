import { createContainer } from "unstated-next";
import React, { useState, useRef, useEffect } from "react";
import { usePendingSegments, getSelectedId, useLogExtent } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";

// this is more a workaround for hooks looping limitation, useLogExtent working with only one log
export default function LogExtent({ log, wellId, updateExtent, currentSelection }) {
  const extent = useLogExtent(log, wellId);

  useEffect(() => {
    if (extent) {
      const [min, max] = extent;
      updateExtent(([currentMin, currentMax]) => [Math.min(currentMin, min), Math.max(currentMax, max)]);
    }
  }, [updateExtent, extent, currentSelection]);
  return null;
}

export const LogsExtentList = ({ wellId }) => {
  const [, updateExtent] = useLogExtentContainer();
  const pendingSegments = usePendingSegments();
  const internalStateRef = useRef({ prevSelection: null });
  const [{ selectionById }] = useComboContainer();
  const currentSelection = getSelectedId(selectionById);
  if (currentSelection !== internalStateRef.current.prevSelection) {
    updateExtent([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    internalStateRef.current.prevSelection = currentSelection;
  }
  return (
    <React.Fragment>
      {pendingSegments.map(s => (
        <LogExtent log={s} key={s.id} updateExtent={updateExtent} wellId={wellId} currentSelection={currentSelection} />
      ))}
    </React.Fragment>
  );
};

function useCalculateLogExtent() {
  return useState([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
}

export const { Provider: LogExtentProvider, useContainer: useLogExtentContainer } = createContainer(
  useCalculateLogExtent
);
