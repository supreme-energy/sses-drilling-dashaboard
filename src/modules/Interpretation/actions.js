import { useComboContainer } from "../ComboDashboard/containers/store";
import { useWellLogList } from "../../api";
import { useCallback } from "react";
import { useWellIdContainer } from "../App/Containers";
import { getCalculateDip, useComputedSegments } from "./selectors";

export function useDragActions() {
  const [{ pendingSegmentsState }, , { updateSegment }] = useComboContainer();
  const { wellId } = useWellIdContainer();
  const [logs, logsById] = useWellLogList(wellId);
  const [segments] = useComputedSegments(wellId);
  const onEndSegmentDrag = useCallback(
    (newPosition, segment) => {
      const log = logsById[segment.id];
      const logIndex = logs.indexOf(log);
      const prevSegment = segments[logIndex - 1];
      if (!log) {
        return;
      }
      const pendingState = pendingSegmentsState[segment.startmd];

      const depth = newPosition.y;
      const calculateDip = getCalculateDip(log, prevSegment);
      const newDip = calculateDip({
        tvd: log.endtvd,
        depth: depth,
        vs: log.endvs,
        fault: pendingState && pendingState.fault
      });
      updateSegment({ dip: newDip }, log.startmd);
    },
    [pendingSegmentsState, updateSegment, logs, logsById, segments]
  );

  const onSegmentDrag = useCallback(
    (newPosition, delta, segment) => {
      const log = logsById[segment.id];

      if (!log) {
        return;
      }

      updateSegment({ fault: segment.fault - delta }, log.startmd);
    },
    [updateSegment, logsById]
  );

  const onStartSegmentDrag = useCallback(
    (newPosition, segment) => {
      const log = logsById[segment.id];
      const logIndex = logs.indexOf(log);
      const prevSegment = segments[logIndex - 1];
      if (!log) {
        return;
      }

      const faultDelta = segment.startdepth - newPosition.y;
      const calculateDip = getCalculateDip(log, prevSegment);

      // calculate reverse dip so that all segments does not move down
      const newDip = calculateDip({
        tvd: log.endtvd,
        depth: segment.enddepth - segment.startdepth + segment.startdepth,
        vs: log.endvs,
        fault: segment.fault + faultDelta
      });

      updateSegment({ dip: newDip, fault: segment.fault + faultDelta }, log.startmd);
    },
    [updateSegment, logs, logsById, segments]
  );

  return { onEndSegmentDrag, onStartSegmentDrag, onSegmentDrag };
}

export function useBiasAndScaleActions(dispatch) {
  const changeSelectedSegmentBiasDelta = useCallback(
    delta => {
      dispatch({
        type: "CHANGE_SELECTED_SEGMENT_BIAS_DELTA",
        delta
      });
    },
    [dispatch]
  );

  const changeSelectedSegmentScale = useCallback(
    (scale, bias) => {
      dispatch({
        type: "CHANGE_SELECTED_SEGMENT_SCALE",
        scale,
        bias
      });
    },
    [dispatch]
  );

  return { changeSelectedSegmentBiasDelta, changeSelectedSegmentScale };
}
