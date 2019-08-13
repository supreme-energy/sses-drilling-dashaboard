import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback, useMemo } from "react";

import {
  getCalculateDip,
  useSelectedWellLog,
  usePendingSegments,
  useComputedDraftSegmentsOnly,
  useComputedDraftSegments,
  useComputedSegments
} from "./selectors";
import debounce from "lodash/debounce";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import pickBy from "lodash/pickBy";
import reduce from "lodash/reduce";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";

// compute dip for each segments from segments group in order to sadisfy depthChange
function getSegmentsDipChangeProperties(pendingSegments, depthChange, computedSegments, totalSegmentsHeight) {
  return pendingSegments.reduce((acc, segment, index) => {
    const logIndex = computedSegments.findIndex(s => s.id === segment.id);
    const prevComputedSegment = computedSegments[logIndex - 1];
    const computedSegment = computedSegments[logIndex];
    const segmentPercentage = (segment.enddepth - segment.startdepth) / totalSegmentsHeight;
    const actualDepth = computedSegment.enddepth + segmentPercentage * depthChange;
    const calculateDip = getCalculateDip(computedSegment, prevComputedSegment);

    const dip = calculateDip({
      tvd: segment.endtvd,
      depth: actualDepth,
      vs: segment.endvs
    });

    acc[segment.endmd] = { dip };
    return acc;
  }, {});
}

export function useDragActions() {
  const [{ draftMode }, , { updateSegments }] = useComboContainer();
  const [, logsById] = useWellLogsContainer();
  const { segments: computedDraftSegments } = useComputedDraftSegments();
  const [cs] = useComputedSegments();
  const computedSegments = draftMode ? computedDraftSegments : cs;
  const { selectedWellLog } = useSelectedWellLog();

  const pendingSegments = usePendingSegments();
  const computedDraftPendingSegments = useComputedDraftSegmentsOnly();
  const computedPendingSegments = useMemo(
    () =>
      draftMode
        ? computedDraftPendingSegments
        : selectedWellLog
        ? [computedSegments.find(s => s.id === selectedWellLog.id)]
        : [],
    [selectedWellLog, computedDraftPendingSegments, computedSegments, draftMode]
  );

  const totalSegmentsHeight = pendingSegments.reduce((sum, segment) => sum + segment.enddepth - segment.startdepth, 0);
  const onEndSegmentDrag = useCallback(
    (newPosition, endSegment) => {
      const depthChange = newPosition.y - computedPendingSegments[pendingSegments.length - 1].enddepth;
      const dipsByMd = getSegmentsDipChangeProperties(
        pendingSegments,
        depthChange,
        computedSegments,
        totalSegmentsHeight
      );
      updateSegments(dipsByMd);
    },
    [updateSegments, computedSegments, pendingSegments, totalSegmentsHeight, computedPendingSegments]
  );

  const onSegmentDrag = useCallback(
    (newPosition, delta, segment) => {
      const log = logsById[segment.id];

      if (!log) {
        return;
      }

      let fault = segment.fault - delta;

      updateSegments({ [log.endmd]: { fault } });
    },
    [updateSegments, logsById]
  );

  const onStartSegmentDrag = useCallback(
    (newPosition, segment) => {
      const log = logsById[segment.id];

      if (!log) {
        return;
      }

      const faultDelta = segment.startdepth - newPosition.y;

      const depthChange = computedPendingSegments[0].startdepth - newPosition.y;
      const propsByMd = getSegmentsDipChangeProperties(
        pendingSegments,
        depthChange,
        computedSegments,
        totalSegmentsHeight
      );

      const fault = segment.fault + faultDelta;
      propsByMd[segment.endmd].fault = fault;

      updateSegments(propsByMd);
    },
    [updateSegments, logsById, computedPendingSegments, pendingSegments, totalSegmentsHeight, computedSegments]
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
  const [{ pendingSegmentsState }, dispatch, { updateSegments }] = useComboContainer();
  const [logs, , { updateWellLogs }] = useWellLogsContainer();

  const logsByEndMd = useMemo(() => keyBy(logs, "endmd"), [logs]);

  const saveWellLogs = useCallback(
    (logs, pendingSegmentsState, fieldsToSave) => {
      const data = logs
        .map(log => {
          console.log("hmm", pendingSegmentsState);
          const pendingState = (log && pendingSegmentsState[log.endmd]) || {};
          const values = {
            dip: pendingState.dip,
            fault: pendingState.fault,
            scalebias: pendingState.bias,
            scalefactor: pendingState.scale
          };
          const fields = pickBy(values, (value, key) => {
            return value !== undefined && (!fieldsToSave || fieldsToSave[key]);
          });

          if (!Object.keys(fields).length) {
            return null;
          }

          return {
            id: log.id,
            ...fields
          };
        })
        .filter(Boolean);

      const resetProps = fieldsToSave
        ? mapValues(fieldsToSave, v => undefined)
        : {
            dip: undefined,
            fault: undefined,
            scalebias: undefined,
            scalefactor: undefined
          };

      const result = updateWellLogs(data);
      const resetLogProps = logs.reduce((acc, log) => {
        acc[log.endmd] = resetProps;
        return acc;
      }, {});

      updateSegments(resetLogProps);

      return result;
    },
    [updateWellLogs, updateSegments]
  );
  const saveSelectedWellLog = useCallback(
    debounce(fieldsToSave => {
      saveWellLogs([selectedWellLog], pendingSegmentsState, fieldsToSave);
    }, 500),
    [dispatch, pendingSegmentsState, selectedWellLog, saveWellLogs]
  );

  const saveAllPendingLogs = useCallback(
    fieldsToSave => {
      const logsToSave = reduce(
        pendingSegmentsState,
        (acc, pendingState, key) => {
          if (logsByEndMd[key]) {
            acc.push(logsByEndMd[key]);
          }

          return acc;
        },
        []
      );
      return saveWellLogs(logsToSave, pendingSegmentsState, fieldsToSave);
    },
    [pendingSegmentsState, saveWellLogs, logsByEndMd]
  );

  // const saveAll = fieldsToSave => {
  //   const
  // }

  return { saveSelectedWellLog, saveAllPendingLogs };
}
