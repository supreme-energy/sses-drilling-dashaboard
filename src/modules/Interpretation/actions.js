import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback } from "react";
import { useWellIdContainer, useSurveysDataContainer } from "../App/Containers";
import { getCalculateDip, useComputedSegments, useSelectedWellLog } from "./selectors";
import debounce from "lodash/debounce";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import pickBy from "lodash/pickBy";

export function useDragActions() {
  const [{ pendingSegmentsState }, , { updateSegment }] = useComboContainer();
  const { wellId } = useWellIdContainer();
  const [logs, logsById] = useWellLogsContainer();
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

      let fault = segment.fault - delta;

      updateSegment({ fault }, log.startmd);
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
      const dip = calculateDip({
        tvd: log.endtvd,
        depth: segment.enddepth,
        vs: log.endvs,
        fault: segment.fault + faultDelta
      });

      const fault = segment.fault + faultDelta;

      updateSegment({ fault, dip }, log.startmd);
    },
    [updateSegment, logs, logsById, segments]
  );

  return { onEndSegmentDrag, onStartSegmentDrag, onSegmentDrag };
}

export function useBiasAndScaleActions(dispatch) {
  const changeSelectedSegmentBias = useCallback(
    bias => {
      dispatch({
        type: "CHANGE_SELECTED_SEGMENT_BIAS",
        bias
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

  return { changeSelectedSegmentScale, changeSelectedSegmentBias };
}

export function useSaveWellLogActions() {
  const { selectedWellLog } = useSelectedWellLog();
  const [{ pendingSegmentsState }, dispatch] = useComboContainer();
  const [, , { updateWellLog }] = useWellLogsContainer();
  const pendingState = selectedWellLog && pendingSegmentsState[selectedWellLog.startmd];
  const saveWellLog = useCallback(
    debounce(() => {
      const values = {
        dip: pendingState.dip,
        fault: pendingState.fault,
        scalebias: pendingState.bias,
        scalefactor: pendingState.scale
      };
      const fields = pickBy(values, value => value !== undefined);

      updateWellLog({
        id: selectedWellLog.id,
        fields
      }).then(() => {
        dispatch({
          type: "RESET_SEGMENT_PENDING_STATE",
          md: selectedWellLog.startmd
        });
      });
    }, 300),
    [updateWellLog, dispatch, pendingState, selectedWellLog]
  );

  return { saveWellLog };
}

export function useSelectInterpretationSegment() {
  const [, , { setSelectedMd }] = useComboContainer();
  const { surveys } = useSurveysDataContainer();
  return useCallback(
    segment => {
      const survey = surveys.find(
        s => segment.startmd - 1 === s.md || (segment.startmd <= s.md && s.md < segment.endmd)
      );

      if (survey) {
        setSelectedMd(survey.md);
      }
    },
    [surveys, setSelectedMd]
  );
}
