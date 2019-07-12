import { useComboContainer } from "../ComboDashboard/containers/store";
import { useMemo, useCallback } from "react";
import { useWellLogList, useWellLogData } from "../../api";
import keyBy from "lodash/keyBy";

export function calcDIP(tvd, depth, vs, lastvs, fault, lasttvd, lastdepth) {
  return -Math.atan((tvd - fault - (lasttvd - lastdepth) - depth) / Math.abs(vs - lastvs)) * 57.29578;
}

export function calcDepth(tvd, dip, vs, lastvs, fault, lasttvd, lastdepth) {
  return tvd - -Math.tan(dip / 57.29578) * Math.abs(vs - lastvs) - fault - (lasttvd - lastdepth);
}

export function useSelectedWellLog(wellId) {
  const [{ selectedMd }] = useComboContainer();
  const [logList] = useWellLogList(wellId);
  const selectedWellLogIndex = useMemo(
    function findCurrentWellLog() {
      return (
        selectedMd &&
        logList.findIndex(l => {
          return l.startmd >= selectedMd && selectedMd < l.endmd;
        })
      );
    },
    [logList, selectedMd]
  );

  const selectedWellLog = logList[selectedWellLogIndex];
  const prevLog = logList[selectedWellLogIndex - 1];

  return { selectedWellLog, prevLog };
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
  const [{ pendingSegmentsState }] = useComboContainer();
  const computedSegments = useMemo(
    () =>
      logList.reduce((acc, l, index) => {
        const pendingState = pendingSegmentsState[l.startmd];
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
        acc.push(newLog);
        return acc;
      }, []),
    [logList, pendingSegmentsState]
  );

  return [computedSegments, keyBy(computedSegments, "id")];
}

export function useGetComputedLogData(wellId, log, prevLog) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  const [computedSegments] = useComputedSegments(wellId);
  const [logList] = useWellLogList(wellId);
  const logIndex = logList.findIndex(l => l.id === log.id);
  const computedSegment = computedSegments[logIndex];
  const prevComputedSegment = computedSegments[logIndex - 1];

  return useMemo(() => {
    if (logData && computedSegment) {
      const calculateDepth = getCalculateDepth(computedSegment, prevComputedSegment);
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
  }, [logData, computedSegment, prevComputedSegment]);
}
