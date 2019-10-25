import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback, useMemo } from "react";
import {
  getCalculateDip,
  useSelectedWellLog,
  usePendingSegments,
  useComputedDraftSegmentsOnly,
  useComputedSegments,
  useCurrentComputedSegments,
  useComputedSurveysAndProjections,
  usePendingSegmentsStateByMd,
  useLastSurvey,
  getLastSurvey
} from "./selectors";
import debounce from "lodash/debounce";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import pickBy from "lodash/pickBy";
import reduce from "lodash/reduce";
import keyBy from "lodash/keyBy";
import mapKeys from "lodash/mapKeys";
import { useProjectionsDataContainer, useSurveysDataContainer } from "../App/Containers";
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
  const [{ draftMode }] = useComboContainer();
  const updateSegments = useUpdateSegmentsByMd();
  const [, logsById] = useWellLogsContainer();
  const { segments: computedDraftSegments } = useComputedSegments();
  const [cs] = useCurrentComputedSegments();
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

  const totalSegmentsHeight = useMemo(
    () => pendingSegments.reduce((sum, segment) => sum + segment.enddepth - segment.startdepth, 0),
    [pendingSegments]
  );
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

export function useSaveWellLogActions() {
  const { selectedWellLog } = useSelectedWellLog();
  const [, dispatch] = useComboContainer();
  const pendingSegmentsState = usePendingSegmentsStateByMd();
  const { replaceResult: replaceProjections } = useProjectionsDataContainer();
  const { replaceResult: replaceSurveys } = useSurveysDataContainer();
  const [logs, , , { updateWellLogs }] = useWellLogsContainer();
  const [, computedSurveys, computedProjections] = useComputedSurveysAndProjections();
  const updateSegments = useUpdateSegmentsByMd();
  const { segments: computedSegments } = useComputedSegments();
  const replaceSurveysAndProjections = useCallback(() => {
    replaceProjections(computedProjections);
    replaceSurveys(computedSurveys);
  }, [replaceProjections, replaceSurveys, computedSurveys, computedProjections]);
  const [, , , { replaceResult: replaceWellLogsResult }] = useWellLogsContainer();

  const replaceWellLogs = useCallback(() => {
    replaceWellLogsResult(computedSegments);
  }, [replaceWellLogsResult, computedSegments]);

  const logsByEndMd = useMemo(() => keyBy(logs, "endmd"), [logs]);

  const saveWellLogs = useCallback(
    async (logs, pendingSegmentsState, fieldsToSave, getIsPending) => {
      const data = logs
        .map(log => {
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

      const resetLogProps = logs.reduce((acc, log) => {
        acc[log.endmd] = resetProps;
        return acc;
      }, {});

      replaceSurveysAndProjections();
      replaceWellLogs();
      updateSegments(resetLogProps);
      await updateWellLogs(data);
    },
    [updateWellLogs, replaceSurveysAndProjections, updateSegments, replaceWellLogs]
  );
  const saveSelectedWellLog = useCallback(
    debounce(getIsPending => {
      saveWellLogs([selectedWellLog], pendingSegmentsState, null, getIsPending);
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

  return { saveSelectedWellLog, saveAllPendingLogs, saveWellLogs };
}

export function useSelectionActions() {
  const [, , , itemsByMd] = useComputedSurveysAndProjections();
  const [, dispatch] = useComboContainer();
  const changeSelection = useCallback(
    (id, ensureSelectionInViewport) => {
      dispatch({ type: "CHANGE_SELECTION", id, ensureSelectionInViewport });
    },
    [dispatch]
  );
  const changeMdSelection = useCallback(
    md => {
      const item = itemsByMd[md];
      if (item) {
        dispatch({ type: "CHANGE_SELECTION", id: item.id });
      }
    },
    [dispatch, itemsByMd]
  );

  return {
    changeSelection,
    changeMdSelection
  };
}

// it will update updateSegments each time surveys changed so that it is up to date with surveys md
// Recommended to be used by components that does not have dirrectly access to surveys/PA
export function useUpdateSegmentsByMd() {
  const [, , , itemsByMd] = useComputedSurveysAndProjections();
  const [, dispatch] = useComboContainer();
  const updateSegments = useCallback(
    propsByMd => {
      dispatch({
        type: "UPDATE_SEGMENTS_PROPERTIES",
        propsById: mapKeys(propsByMd, (value, md) => {
          const item = itemsByMd[md];
          return item && item.id;
        })
      });
    },
    [dispatch, itemsByMd]
  );

  return updateSegments;
}

// useUpdateSegmentsByMd can recreate updateSegments very often when state is updated as result of drag operations.
// updateSegments created by useUpdateSegmentsById as opposite will only be created once
// so it will not trigger unnecessary updates further.
// Good to use for components that have directly access to surveys like cross section
export function useUpdateSegmentsById() {
  const [, dispatch] = useComboContainer();
  const updateSegments = useCallback(
    propsById =>
      dispatch({
        type: "UPDATE_SEGMENTS_PROPERTIES",
        propsById
      }),
    [dispatch]
  );

  return updateSegments;
}

export function useSelectLastSurvey() {
  const lastSurvey = useLastSurvey();

  const [, dispatch] = useComboContainer();

  return useCallback(
    ensureSelectionInViewport => {
      if (lastSurvey) {
        dispatch({ type: "CHANGE_SELECTION", id: lastSurvey.id, ensureSelectionInViewport });
      }
    },
    [dispatch, lastSurvey]
  );
}

export function useRefreshSurveysAndUpdateSelection() {
  const { refreshSurveys } = useSurveysDataContainer();
  const [, dispatch] = useComboContainer();

  return useCallback(async () => {
    const newSurveys = await refreshSurveys();
    const lastSurvey = getLastSurvey(newSurveys);

    if (lastSurvey) {
      dispatch({ type: "CHANGE_SELECTION", id: lastSurvey.id, ensureSelectionInViewport: true });
    }
  }, [refreshSurveys, dispatch]);
}
