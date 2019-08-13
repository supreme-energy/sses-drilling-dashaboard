import { useComboContainer } from "../ComboDashboard/containers/store";
import { useMemo, useCallback } from "react";
import { useWellLogData, EMPTY_ARRAY } from "../../api";
import keyBy from "lodash/keyBy";
import { useWellIdContainer, useSurveysDataContainer, useProjectionsDataContainer } from "../App/Containers";
import { extent } from "d3-array";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import memoizeOne from "memoize-one";
import reduce from "lodash/reduce";

export function calcDIP(tvd, depth, vs, lastvs, fault, lasttvd, lastdepth) {
  return -Math.atan((tvd - fault - (lasttvd - lastdepth) - depth) / Math.abs(vs - lastvs)) * 57.29578;
}

export function calcDepth(tvd, dip, vs, lastvs, fault, lasttvd, lastdepth) {
  return tvd - -Math.tan(dip / 57.29578) * Math.abs(vs - lastvs) - fault - (lasttvd - lastdepth);
}

export function calcTot(pTot, dip, vs, pVs, fault) {
  let tot = pTot + -Math.tan(dip / 57.29578) * Math.abs(vs - pVs);
  tot += fault;
  return tot;
}

export function findCurrentWellLog(logList, md) {
  return md
    ? logList.findIndex(l => {
        return md === l.endmd;
      })
    : -1;
}

export const getPendingSegments = memoizeOne((selectedMd, logs, nrPrevSurveysToDraft, draftMode) => {
  if (!selectedMd || !logs) {
    return EMPTY_ARRAY;
  }
  const selectedIndex = logs.findIndex(l => l.endmd === selectedMd);

  if (selectedIndex === -1) {
    return EMPTY_ARRAY;
  }

  if (!draftMode) {
    return [logs[selectedIndex]];
  }
  return logs.slice(Math.max(selectedIndex - nrPrevSurveysToDraft, 0), selectedIndex + 1);
});

export function useGetLogByMd(md) {
  const [logList] = useWellLogsContainer();
  const logIndex = useMemo(() => findCurrentWellLog(logList, md), [logList, md]);

  const wellLog = logList[logIndex];
  const prevLog = logList[logIndex - 1];

  return { wellLog, prevLog, logIndex };
}

export function useSelectedWellLog() {
  const [{ selectedMd }] = useComboContainer();
  const { wellLog, prevLog, logIndex } = useGetLogByMd(selectedMd);
  return { selectedWellLog: wellLog, prevLog, selectedWellLogIndex: logIndex };
}

export function getCalculateDip(log, prevLog) {
  let { startvs: lastVS, starttvd: lastTVD } = log;
  let lastDepth = log.starttvd;
  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastDepth = prevLog.enddepth;
  }

  return ({ tvd, depth, vs, fault }) => {
    const actualFault = fault !== undefined ? fault : log.fault;
    const dip = calcDIP(tvd, depth, vs, lastVS, actualFault, lastTVD, lastDepth);
    return dip;
  };
}

function getCalculateDepth(log, prevLog) {
  let { startvs: lastVS, starttvd: lastTVD } = log;
  let lastDepth = log.starttvd;

  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastDepth = prevLog.enddepth;
  }

  return ({ tvd, dip, vs, fault }) => {
    const actualFault = fault !== undefined ? fault : log.fault;
    const depth = calcDepth(tvd, dip, vs, lastVS, actualFault, lastTVD, lastDepth);
    return depth;
  };
}

export function useCalculateDipFromSurvey(wellId) {
  let { selectedWellLog, prevLog } = useSelectedWellLog(wellId);
  if (!selectedWellLog) {
    selectedWellLog = prevLog = {};
  }

  return useCallback(getCalculateDip(selectedWellLog, prevLog), [selectedWellLog, prevLog]);
}

export function useDraftSegmentsByEndMd(segment) {
  const { selectedWellLogIndex } = useSelectedWellLog();
  const [{ nrPrevSurveysToDraft }] = useComboContainer();
  const [logList] = useWellLogsContainer();
  return useMemo(
    () =>
      keyBy(
        logList.slice(Math.max(selectedWellLogIndex - nrPrevSurveysToDraft, 0), selectedWellLogIndex + 1),
        d => d.endmd
      ),
    [logList, selectedWellLogIndex, nrPrevSurveysToDraft]
  );
}

const reduceComputedSegment = pendingSegmentsState => (acc, l, index) => {
  const getNewLog = () => {
    const pendingState = pendingSegmentsState[l.endmd];
    const newLog = {
      ...l
    };

    if (pendingState && pendingState.fault !== undefined) {
      newLog.fault = pendingState.fault;
    }

    if (pendingState && pendingState.dip !== undefined) {
      newLog.sectdip = pendingState.dip;
    }

    if (pendingState && pendingState.bias !== undefined) {
      newLog.scalebias = pendingState.bias;
    }

    if (pendingState && pendingState.scale !== undefined) {
      newLog.scalefactor = pendingState.scale;
    }
    const prevItem = acc[index - 1];

    const calculateDepth = getCalculateDepth(newLog, prevItem);
    newLog.startdepth = calculateDepth({ tvd: l.starttvd, dip: newLog.sectdip, vs: l.startvs });
    newLog.enddepth = calculateDepth({ tvd: l.endtvd, dip: newLog.sectdip, vs: l.endvs });
    return newLog;
  };
  const log = getNewLog();

  acc.push(log);
  return acc;
};

// return all segment with computed properties
export function useComputedDraftSegments() {
  const [logList] = useWellLogsContainer();
  const [{ pendingSegmentsState }] = useComboContainer();

  const computedSegments = useMemo(() => {
    return logList.reduce(reduceComputedSegment(pendingSegmentsState), []);
  }, [logList, pendingSegmentsState]);

  const byId = useMemo(() => keyBy(computedSegments, "id"), [computedSegments]);

  return {
    segments: computedSegments,
    byId
  };
}

// return only segments that are in draft mode
export function useComputedDraftSegmentsOnly() {
  const { segments } = useComputedDraftSegments();
  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();
  const { selectedWellLogIndex } = useSelectedWellLog();

  return useMemo(
    () =>
      draftMode
        ? segments.slice(Math.max(selectedWellLogIndex - nrPrevSurveysToDraft, 0), selectedWellLogIndex + 1)
        : EMPTY_ARRAY,
    [selectedWellLogIndex, nrPrevSurveysToDraft, segments, draftMode]
  );
}

const getComputedSegments = memoizeOne((logList, pendingSegmentsState, draftMode) => {
  // recompute logs with empty pending state because there is a situation
  // when log is saved and dip/fault is updated on welllog but depth need to be recalculated
  const computedSegments = draftMode
    ? logList.reduce(reduceComputedSegment({}), [])
    : logList.reduce(reduceComputedSegment(pendingSegmentsState), []);
  const computedSegmentsById = keyBy(computedSegments, "id");
  return [computedSegments, computedSegmentsById];
});

export function useComputedSegments() {
  const [logList] = useWellLogsContainer();
  const [{ pendingSegmentsState, draftMode }] = useComboContainer();
  return getComputedSegments(logList, pendingSegmentsState, draftMode);
}

export function useGetComputedLogData(wellId, log, draft) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  const { byId: draftLogsById } = useComputedDraftSegments();
  const [computedSegments] = useComputedSegments();
  const [logList] = useWellLogsContainer();
  const logIndex = logList.findIndex(l => l.id === log.id);
  let computedSegment = computedSegments[logIndex];
  let prevComputedSegment = computedSegments[logIndex - 1];

  if (draft) {
    computedSegment = draftLogsById[computedSegment.id];
    prevComputedSegment = prevComputedSegment && draftLogsById[prevComputedSegment.id];
  }

  return useMemo(() => {
    if (logData && computedSegment) {
      const currentLogData = { ...log, fault: computedSegment.fault };
      const calculateDepth = getCalculateDepth(currentLogData, prevComputedSegment);
      return {
        ...logData,
        scalebias: computedSegment.scalebias,
        scalefactor: computedSegment.scalefactor,
        data: logData.data.reduce((acc, d, index) => {
          const { vs, tvd } = d;

          const newLog = { ...d };

          const depth = calculateDepth({ tvd, dip: computedSegment.sectdip, vs });
          newLog.depth = depth;

          acc.push(newLog);

          return acc;
        }, [])
      };
    }

    return logData;
  }, [logData, computedSegment, prevComputedSegment, log]);
}

export function useComputedSurveysAndProjections() {
  const { surveys } = useSurveysDataContainer();
  const [{ pendingSegmentsState, draftMode, selectedMd }] = useComboContainer();
  const { projectionsData } = useProjectionsDataContainer();
  return useMemo(
    () =>
      surveys.concat(projectionsData).reduce((acc, next, index) => {
        const prevItem = acc[index - 1] || next;
        const pendingState = (draftMode && selectedMd === next.md ? {} : pendingSegmentsState[next.md]) || {};

        const dipPending = pendingState.dip !== undefined;
        const faultPending = pendingState.fault !== undefined;
        const dip = dipPending ? pendingState.dip : next.dip;
        const fault = faultPending ? pendingState.fault : next.fault;

        const tcl = prevItem.tcl + -Math.tan(dip / 57.29578) * Math.abs(next.vs - prevItem.vs) + fault;

        acc[index] = { ...next, tcl, fault, dip };

        return acc;
      }, []),
    [surveys, draftMode, pendingSegmentsState, selectedMd, projectionsData]
  );
}

export function useSelectedSurvey() {
  const [{ selectedMd }] = useComboContainer();
  const computedSurveys = useComputedSurveysAndProjections();
  return useMemo(() => computedSurveys.find(s => s.md === selectedMd), [selectedMd, computedSurveys]);
}

export function getIsDraft(index, selectedIndex, nrPrevSurveysToDraft) {
  return index <= selectedIndex && index >= selectedIndex - nrPrevSurveysToDraft;
}

export function useComputedFormations(formations) {
  const computedSurveys = useComputedSurveysAndProjections();

  const computedFormations = useMemo(
    () =>
      formations.map(f => {
        return {
          ...f,
          data: f.data.map((item, index) => {
            const survey = computedSurveys[index];

            if (!survey) {
              return item;
            }

            return {
              ...item,
              fault: survey.fault,
              dip: survey.dip,
              tot: survey.tcl + item.thickness
            };
          })
        };
      }),
    [formations, computedSurveys]
  );

  return computedFormations;
}
export const getExtent = logData => (logData ? extent(logData.data, d => d.value) : [0, 0]);

export function useLogExtent(log, wellId) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  return useMemo(() => getExtent(logData), [logData]);
}

export function useSelectedLogExtent() {
  const { wellId } = useWellIdContainer();
  const { selectedWellLog } = useSelectedWellLog();
  return useLogExtent(selectedWellLog, wellId);
}

export function usePendingSegments() {
  const [logs] = useWellLogsContainer();

  const [{ selectedMd, nrPrevSurveysToDraft, draftMode }] = useComboContainer();

  const pendingSegments = getPendingSegments(selectedMd, logs, nrPrevSurveysToDraft, draftMode);

  return pendingSegments;
}

export function useSelectedSegmentState() {
  const [{ draftMode }] = useComboContainer();
  const [, computedSegmentsById] = useComputedSegments();
  const { byId: draftSegmentsById } = useComputedDraftSegments();
  const { selectedWellLog } = useSelectedWellLog();
  const map = draftMode ? draftSegmentsById : computedSegmentsById;
  return (selectedWellLog && map[selectedWellLog.id]) || {};
}

export function useGetChangedPendingStateFields() {
  const [{ pendingSegmentsState }] = useComboContainer();

  return reduce(
    pendingSegmentsState,
    (acc, pendingState) => {
      if (pendingState.dip !== undefined) {
        acc.dip = true;
      }

      if (pendingState.fault !== undefined) {
        acc.fault = true;
      }

      return acc;
    },
    { dip: false, fault: false }
  );
}
