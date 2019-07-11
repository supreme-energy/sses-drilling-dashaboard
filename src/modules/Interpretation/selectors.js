import { useComboContainer } from "../ComboDashboard/containers/store";
import { useMemo, useCallback } from "react";
import { useWellLogList, useWellLogData } from "../../api";

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

function getCalculateDip(log, prevLog) {
  let { startvs: lastVS, starttvd: lastTVD, startmd: lastMD, startdepth: lastDepth } = log;

  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastMD = prevLog.endmd;
    lastDepth = prevLog.enddepth;
  }

  return ({ tvd, depth, vs }) => {
    const dip = calcDIP(tvd, depth, vs, lastVS, log.fault, lastTVD, lastDepth);
    return dip;
  };
}

function getCalculateDepth(log, prevLog) {
  let { startvs: lastVS, starttvd: lastTVD, startmd: lastMD, startdepth: lastDepth } = log;

  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastMD = prevLog.endmd;
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

        if (pendingState) {
          if (pendingState.dip !== undefined) {
            const calculateDepth = getCalculateDepth(l, acc[index - 1]);
            newLog.enddepth = calculateDepth({ tvd: l.endtvd, dip: pendingState.dip, vs: l.endvs });
          }

          if (pendingState.fault !== undefined) {
            newLog.startdepth = newLog.startdepth - pendingState.fault;
            newLog.enddepth = newLog.enddepth - pendingState.fault;
          }
        }
        acc.push(newLog);
        return acc;
      }, []),
    [logList, pendingSegmentsState]
  );

  return computedSegments;
}

export function useGetComputedLogData(wellId, log, prevLog) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  const [{ pendingSegmentsState }] = useComboContainer();
  if (!logData) {
    return logData;
  }
  const pendingState = pendingSegmentsState[log.startmd];

  if (!pendingState) {
    return logData;
  }

  const calculateDepth = getCalculateDepth(log, prevLog);

  return {
    ...logData,
    data: logData.data.map(d => {
      const { vs, tvd } = d;

      let newLog = d;

      if (pendingState) {
        newLog = { ...d };
        if (pendingState.dip !== undefined) {
          const depth = calculateDepth({ tvd, dip: pendingState.dip, vs });
          newLog.depth = depth;
        }

        if (pendingState.fault !== undefined) {
          const depth = newLog.depth - pendingState.fault;
          newLog.depth = depth;
        }
      }

      return newLog;
    })
  };
}
