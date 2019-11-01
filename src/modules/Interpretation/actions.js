import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback, useMemo, useRef, useReducer, useEffect } from "react";
import {
  getCalculateDip,
  useSelectedWellLog,
  usePendingSegments,
  useComputedDraftSegmentsOnly,
  useComputedSegments,
  useCurrentComputedSegments,
  useComputedSurveysAndProjections,
  usePendingSegmentsStateByWellLog,
  useLastSurvey,
  getLastSurvey,
  useGetSurveysByWellLog
} from "./selectors";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import pickBy from "lodash/pickBy";
import reduce from "lodash/reduce";
import mapKeys from "lodash/mapKeys";
import { useProjectionsDataContainer, useSurveysDataContainer } from "../App/Containers";
import mapValues from "lodash/mapValues";
import { surveysTransform } from "../../api";

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

    acc[segment.id] = { dip };
    return acc;
  }, {});
}

export function useDragActions() {
  const [{ draftMode }] = useComboContainer();
  const updateSegments = useUpdateWellLogs();
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
      const dipsById = getSegmentsDipChangeProperties(
        pendingSegments,
        depthChange,
        computedSegments,
        totalSegmentsHeight
      );

      updateSegments(dipsById);
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

      updateSegments({ [log.id]: { fault } });
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
      const propsById = getSegmentsDipChangeProperties(
        pendingSegments,
        depthChange,
        computedSegments,
        totalSegmentsHeight
      );

      const fault = segment.fault + faultDelta;
      propsById[segment.id].fault = fault;

      updateSegments(propsById);
    },
    [updateSegments, logsById, computedPendingSegments, pendingSegments, totalSegmentsHeight, computedSegments]
  );

  return { onEndSegmentDrag, onStartSegmentDrag, onSegmentDrag };
}

export function useSaveWellLogActions() {
  const { selectedWellLog } = useSelectedWellLog();
  const pendingSegmentsState = usePendingSegmentsStateByWellLog();
  const { replaceResult: replaceProjections } = useProjectionsDataContainer();
  const { replaceResult: replaceSurveys } = useSurveysDataContainer();
  const [, logsById, , { updateWellLogs }] = useWellLogsContainer();
  const [, computedSurveys, computedProjections] = useComputedSurveysAndProjections();
  const updateSegments = useUpdateWellLogs();
  const { segments: computedSegments } = useComputedSegments();
  const replaceSurveysAndProjections = useCallback(() => {
    replaceProjections(computedProjections);
    replaceSurveys(computedSurveys);
  }, [replaceProjections, replaceSurveys, computedSurveys, computedProjections]);
  const [, , , { replaceResult: replaceWellLogsResult }] = useWellLogsContainer();

  const replaceWellLogs = useCallback(() => {
    replaceWellLogsResult(computedSegments);
  }, [replaceWellLogsResult, computedSegments]);

  const [wellLogsChangeTrigger, changeWellLogsTrigger] = useReducer(v => v + 1, 0);
  const internalState = useRef({ lastTriggerId: 0 });

  const saveWellLogs = useCallback(
    async (logs, pendingSegmentsState, fieldsToSave, getIsPending = () => false) => {
      const data = logs
        .map(log => {
          const pendingState = (log && pendingSegmentsState[log.id]) || {};
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
        acc[log.id] = resetProps;
        return acc;
      }, {});

      changeWellLogsTrigger();
      console.log("save", data);
      await updateWellLogs(data);

      if (!getIsPending()) {
        console.log("reset", resetLogProps);
        updateSegments(resetLogProps);
      }
    },
    [updateWellLogs, updateSegments, changeWellLogsTrigger]
  );

  useEffect(() => {
    if (internalState.current.lastTriggerId !== wellLogsChangeTrigger) {
      internalState.current.lastTriggerId = wellLogsChangeTrigger;
      replaceSurveysAndProjections();
    }
  }, [wellLogsChangeTrigger, replaceSurveysAndProjections, replaceWellLogs]);

  const saveSelectedWellLog = useCallback(
    getIsPending => {
      saveWellLogs([selectedWellLog], pendingSegmentsState, null, getIsPending);
    },
    [pendingSegmentsState, selectedWellLog, saveWellLogs]
  );

  const saveAllPendingLogs = useCallback(
    fieldsToSave => {
      const logsToSave = reduce(
        pendingSegmentsState,
        (acc, pendingState, key) => {
          if (logsById[key]) {
            acc.push(logsById[key]);
          }

          return acc;
        },
        []
      );
      return saveWellLogs(logsToSave, pendingSegmentsState, fieldsToSave);
    },
    [pendingSegmentsState, saveWellLogs, logsById]
  );

  return { saveSelectedWellLog, saveAllPendingLogs, saveWellLogs };
}

export function useSelectionActions() {
  const { surveys } = useSurveysDataContainer();
  const [, , wellLogs] = useWellLogsContainer();
  const [, dispatch] = useComboContainer();
  const changeSelection = useCallback(
    (id, ensureSelectionInViewport, centerSelectionInCS) => {
      dispatch({ type: "CHANGE_SELECTION", id, ensureSelectionInViewport, centerSelectionInCS });
    },
    [dispatch]
  );
  const changeWellLogSelection = useCallback(
    wellLog => {
      const index = wellLogs.findIndex(l => wellLog.id === l.id);

      const survey = surveys[index >= 0 ? index + 1 : -1];

      if (survey) {
        dispatch({ type: "CHANGE_SELECTION", id: survey.id });
      }
    },
    [dispatch, surveys, wellLogs]
  );

  return {
    changeSelection,
    changeWellLogSelection
  };
}

// it will update updateSegments each time surveys changed so that it is up to date with surveys md
// Recommended to be used by components that does not have dirrectly access to surveys/PA
export function useUpdateWellLogs() {
  const [, dispatch] = useComboContainer();
  const surveysByWellLog = useGetSurveysByWellLog();
  const updateSegments = useCallback(
    propsByWellLogId => {
      dispatch({
        type: "UPDATE_SEGMENTS_PROPERTIES",
        propsById: mapKeys(propsByWellLogId, (value, logId) => {
          const item = surveysByWellLog[logId];

          return item && item.id;
        })
      });
    },
    [dispatch, surveysByWellLog]
  );

  return updateSegments;
}

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
    const lastSurvey = getLastSurvey(surveysTransform(newSurveys));

    if (lastSurvey) {
      dispatch({ type: "CHANGE_SELECTION", id: lastSurvey.id, ensureSelectionInViewport: true });
    }
  }, [refreshSurveys, dispatch]);
}
