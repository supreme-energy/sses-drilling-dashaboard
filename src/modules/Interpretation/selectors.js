import { useComboContainer } from "../ComboDashboard/containers/store";
import { useMemo, useCallback } from "react";
import { useWellLogData } from "../../api";
import keyBy from "lodash/keyBy";
import { useWellIdContainer, useSurveysDataContainer } from "../App/Containers";
import { extent } from "d3-array";
import memoizeOne from "memoize-one";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";

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
  return (
    md &&
    logList.findIndex(l => {
      return l.startmd >= md && md < l.endmd;
    })
  );
}

function recalculateFormations(pTot, dip, vs, pVs, fault, thickness) {
  let tot = calcTot(pTot, dip, vs, pVs, fault);
  tot += thickness;
  return tot;
}

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

export function useComputedSegments(wellId) {
  const [logList] = useWellLogsContainer();
  const [{ pendingSegmentsState, draftMode }] = useComboContainer();
  const { selectedWellLogIndex } = useSelectedWellLog(wellId);
  const computedSegments = useMemo(
    () =>
      logList.reduce((acc, l, index) => {
        const isDraft = draftMode && index === selectedWellLogIndex;
        const getNewLog = usePending => {
          const pendingState = usePending ? pendingSegmentsState[l.startmd] : {};
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
  const [logList] = useWellLogsContainer();
  const logIndex = logList.findIndex(l => l.id === log.id);
  let computedSegment = computedSegments[logIndex];
  const prevComputedSegment = computedSegments[logIndex - 1];

  if (draft) {
    computedSegment = computedSegment && computedSegment.draftData;
  }

  return useMemo(() => {
    if (logData && computedSegment) {
      const currentLogData = { ...log, fault: computedSegment.fault };
      const calculateDepth = getCalculateDepth(currentLogData, prevComputedSegment);
      return {
        ...logData,
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

export function useComputedFormations(formations) {
  const { wellId } = useWellIdContainer();
  const [computedSegments] = useComputedSegments(wellId);
  const { surveysData } = useSurveysDataContainer();
  const segmentByEndMd = useMemo(() => keyBy(computedSegments, "endmd"), [computedSegments]);

  const computedSurveys = useMemo(
    () =>
      formations.map(f => {
        return {
          ...f,
          data: f.data.map((item, index) => {
            const segment = segmentByEndMd[item.md];

            const surveyItem = surveysData[index];
            const prevSurveyItem = surveysData[index - 1] || surveyItem;
            if (!segment || !surveyItem) {
              return item;
            }

            return {
              ...item,
              tot: recalculateFormations(
                prevSurveyItem.tot,
                segment.sectdip,
                surveyItem.vs,
                prevSurveyItem.vs,
                segment.fault,
                item.thickness
              )
            };
          })
        };
      }),
    [formations, segmentByEndMd, surveysData]
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

export function useSelectedSegmentState() {
  const { wellId } = useWellIdContainer();
  const [, computedSegmentsById] = useComputedSegments(wellId);
  const { selectedWellLog } = useSelectedWellLog();

  return (selectedWellLog && computedSegmentsById[selectedWellLog.id]) || {};
}
