import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback } from "react";
import { useWellIdContainer, useSurveysDataContainer } from "../App/Containers";
import { getCalculateDip, useComputedSegments } from "./selectors";
import debounce from "lodash/debounce";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";

export function useDragActions() {
  const [{ pendingSegmentsState }, dispatch, { updateSegment }] = useComboContainer();
  const { wellId } = useWellIdContainer();
  const [logs, logsById, { updateWellLog }] = useWellLogsContainer();
  const [segments] = useComputedSegments(wellId);

  const saveWellLog = useCallback(
    debounce((fields, log) => {
      updateWellLog({ id: log.id, fields }).then(() => {
        dispatch({
          type: "RESET_SEGMENT_PENDING_STATE",
          md: log.startmd
        });
      });
    }, 300),
    [wellId, updateWellLog, dispatch]
  );

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

      saveWellLog({ sectdip: newDip }, log);
    },
    [pendingSegmentsState, updateSegment, logs, logsById, segments, saveWellLog]
  );

  const onSegmentDrag = useCallback(
    (newPosition, delta, segment) => {
      const log = logsById[segment.id];

      if (!log) {
        return;
      }

      let fault = segment.fault - delta;

      updateSegment({ fault }, log.startmd);

      saveWellLog({ fault }, log);
    },
    [updateSegment, logsById, saveWellLog]
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
      const dip = calculateDip({
        tvd: log.endtvd,
        depth: segment.enddepth,
        vs: log.endvs,
        fault: segment.fault + faultDelta
      });

      const fault = segment.fault + faultDelta;

      updateSegment({ fault, dip }, log.startmd);

      saveWellLog({ dip, fault }, log);
    },
    [updateSegment, logs, logsById, segments, saveWellLog]
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
