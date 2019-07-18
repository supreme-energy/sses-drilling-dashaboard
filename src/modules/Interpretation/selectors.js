import { useComboContainer } from "../ComboDashboard/containers/store";
import { useMemo, useCallback } from "react";
import { useWellLogList, useWellLogData } from "../../api";
import keyBy from "lodash/keyBy";
import { useWellIdContainer } from "../App/Containers";
import find from "lodash/find";
import { extent } from "d3-array";
import memoizeOne from "memoize-one";

export function calcDIP(tvd, depth, vs, lastvs, fault, lasttvd, lastdepth) {
  return -Math.atan((tvd - fault - (lasttvd - lastdepth) - depth) / Math.abs(vs - lastvs)) * 57.29578;
}

export function calcDepth(tvd, dip, vs, lastvs, fault, lasttvd, lastdepth) {
  return tvd - -Math.tan(dip / 57.29578) * Math.abs(vs - lastvs) - fault - (lasttvd - lastdepth);
}

export function findCurrentWellLog(logList, md) {
  return (
    md &&
    logList.findIndex(l => {
      return l.startmd >= md && md < l.endmd;
    })
  );
}

export function useGetLogByMd(md) {
  const { wellId } = useWellIdContainer();
  const [logList] = useWellLogList(wellId);
  const logIndex = useMemo(() => findCurrentWellLog(logList, md), [logList, md]);

  const wellLog = logList[logIndex];
  const prevLog = logList[logIndex - 1];

  return { wellLog, prevLog, logIndex };
}

export function useSelectedWellLog(wellId) {
  const [{ selectedMd }] = useComboContainer();
  const { wellLog, prevLog, logIndex } = useGetLogByMd(selectedMd);
  return { selectedWellLog: wellLog, prevLog, selectedWellLogIndex: logIndex };
}

export function getCalculateDip(log, prevLog) {
  let { startvs: lastVS, starttvd: lastTVD, startdepth: lastDepth } = log;

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
  let { startvs: lastVS, starttvd: lastTVD, startdepth: lastDepth } = log;

  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastDepth = prevLog.enddepth;
  }

  return ({ tvd, dip, vs }) => {
    const depth = calcDepth(tvd, dip, vs, lastVS, log.fault, lastTVD, lastDepth);
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

export function useComputedSegments(wellId) {
  const [logList] = useWellLogList(wellId);
  const [{ pendingSegmentsState, draftMode }] = useComboContainer();
  const { selectedWellLogIndex } = useSelectedWellLog(wellId);
  const computedSegments = useMemo(
    () =>
      logList.reduce((acc, l, index) => {
        const isDraft = draftMode && index === selectedWellLogIndex;
        const getNewLog = usePending => {
          const pendingState = usePending ? pendingSegmentsState[l.startmd] : {};
          let newLog = {
            ...l
          };

          if (pendingState && pendingState.fault !== undefined) {
            newLog.fault = pendingState.fault;
          }

          if (pendingState && pendingState.dip !== undefined) {
            newLog.sectdip = pendingState.dip;
          }

          const calculateDepth = getCalculateDepth(newLog, acc[index - 1]);
          newLog.startdepth = calculateDepth({ tvd: l.starttvd, dip: newLog.sectdip, vs: l.startvs });
          newLog.enddepth = calculateDepth({ tvd: l.endtvd, dip: newLog.sectdip, vs: l.endvs });
          return newLog;
        };
        const log = getNewLog(!isDraft);
        if (isDraft) {
          log.draftData = getNewLog(true);
        }
        acc.push(log);
        return acc;
      }, []),
    [logList, pendingSegmentsState, selectedWellLogIndex, draftMode]
  );

  const computedSegmentsById = useMemo(() => keyBy(computedSegments, "id"), [computedSegments]);

  return [computedSegments, computedSegmentsById];
}

export function useGetComputedLogData(wellId, log, draft) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  const [computedSegments] = useComputedSegments(wellId);
  const [logList] = useWellLogList(wellId);
  const logIndex = logList.findIndex(l => l.id === log.id);
  let computedSegment = computedSegments[logIndex];
  const prevComputedSegment = computedSegments[logIndex - 1];

  if (draft) {
    computedSegment = computedSegment && computedSegment.draftData;
  }

  return useMemo(() => {
    if (logData && computedSegment) {
      const calculateDepth = getCalculateDepth({ ...log, fault: computedSegment.fault }, prevComputedSegment);
      return {
        ...logData,
        data: logData.data.reduce((acc, d, index) => {
          const { vs, tvd } = d;

          let newLog = { ...d };

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

function calculateSurveys(surveys, pendingSegmentsState) {
  return surveys.reduce((acc, s, index) => {
    const pendingState = find(pendingSegmentsState, (ps, md) => {
      return (index === 0 && s.md > md) || (index > 0 && surveys[index - 1].md <= md && s.md > md);
    });

    const prevSurvey = acc[index - 1];
    const dip = pendingState && pendingState.dip !== undefined ? pendingState.dip : s.dip;
    const fault = pendingState && pendingState.fault !== undefined ? pendingState.fault : s.fault;
    let lastVS = s.vs;
    let lastTVD = s.tvd;
    let lastDepth = s.tvd;

    if (prevSurvey) {
      lastVS = prevSurvey.vs;
      lastTVD = prevSurvey.initialTVD;
      lastDepth = prevSurvey.depth;
    }

    const depth = calcDepth(s.tvd, dip, s.vs, lastVS, fault, lastTVD, lastDepth);

    const newSurvey = {
      ...s,
      fault,
      dip,
      depth,
      tvd: depth,
      initialTVD: s.tvd
    };
    acc[index] = newSurvey;
    return acc;
  }, []);
}

// export function useComputedSurveys(surveys) {
//   const [{ pendingSegmentsState }] = useComboContainer();
//   const computedSurveys = useMemo(() => calculateSurveys(surveys, pendingSegmentsState), [
//     surveys,
//     pendingSegmentsState
//   ]);

//   return computedSurveys;
// }

export function useComputedSurveys(surveys) {
  const { wellId } = useWellIdContainer();
  const [computedSegments] = useComputedSegments(wellId);
  const computedSurveys = useMemo(
    () =>
      surveys.map(s => {
        const segment = computedSegments.find(seg => s.md >= seg.startmd && s.md <= seg.endmd);
        if (!segment) {
          return s;
        }

        return {
          ...s,
          tvd: segment.enddepth
        };
      }),
    [computedSegments, surveys]
  );

  return computedSurveys;
}
const getExtent = memoizeOne(logData => (logData ? extent(logData.data, d => d.value) : [0, 0]));

export function useSelectedLogExtent() {
  const { wellId } = useWellIdContainer();
  const { selectedWellLog } = useSelectedWellLog();
  const [logData] = useWellLogData(wellId, selectedWellLog && selectedWellLog.tablename);

  return getExtent(logData);
}

export function useGetLogExtent(log) {
  const { wellId } = useWellIdContainer();
  const [logData] = useWellLogData(wellId, log && log.tablename);

  return getExtent(logData);
}

export function useGetSelectedSegmentPendingState(state) {
  const { selectedMd, pendingSegmentsState } = state;
  return useMemo(() => pendingSegmentsState[selectedMd] || { bias: 0, scale: 1 }, [pendingSegmentsState, selectedMd]);
}
