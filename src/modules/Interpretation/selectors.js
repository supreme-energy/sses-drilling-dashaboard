import { useComboContainer } from "../ComboDashboard/containers/store";
import { useCallback, useMemo } from "react";
import some from "lodash/some";
import { EMPTY_ARRAY, useWellLogData } from "../../api";
import keyBy from "lodash/keyBy";
import {
  useProjectionsDataContainer,
  useSurveysDataContainer,
  useWellIdContainer,
  useSelectedWellInfoContainer,
  useFormationsDataContainer,
  useWellPlanDataContainer,
  useControlLogDataContainer
} from "../App/Containers";
import { extent, min, max } from "d3-array";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import memoizeOne from "memoize-one";
import reduce from "lodash/reduce";
import mapKeys from "lodash/mapKeys";
import { toDegrees, toRadians } from "../ComboDashboard/components/CrossSection/formulas";
import { calculateProjection } from "../../hooks/projectionCalculations";
import memoize from "react-powertools/memoize";
import { useFormationsStore } from "./InterpretationChart/Formations/store";
import findLast from "lodash/findLast";

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

// only consider single selection
export function useSelectedMd() {
  const [, , , , byId] = useComputedSurveysAndProjections();
  const [{ selectionById }] = useComboContainer();
  return useMemo(() => {
    const selectedId = getSelectedId(selectionById);
    const selectedItem = byId[selectedId];
    return selectedItem && selectedItem.md;
  }, [byId, selectionById]);
}

export function useSelectedWellLog() {
  const selectedMd = useSelectedMd();
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

const getComputedSegments = memoizeOne((logList, pendingSegmentsState) => {
  const segments = logList.reduce(reduceComputedSegment(pendingSegmentsState), []);
  const byId = keyBy(segments, "id");
  return { segments, byId };
});

const getPendingSegmentsByMd = memoizeOne((pendingSegmentsState, byId) =>
  mapKeys(pendingSegmentsState, (value, key) => {
    const item = byId[key];
    return item && item.md;
  })
);

export function usePendingSegmentsStateByMd() {
  const [{ pendingSegmentsState }] = useComboContainer();
  const [, , , , byId] = useComputedSurveysAndProjections();

  return getPendingSegmentsByMd(pendingSegmentsState, byId);
}

// return all segment with computed properties
export function useComputedSegments() {
  const [filteredLogs, , allLogs] = useWellLogsContainer();
  const pendingStateByMd = usePendingSegmentsStateByMd();
  const { segments, byId } = getComputedSegments(allLogs, pendingStateByMd);
  const filteredSegments = useMemo(() => filteredLogs.map(l => byId[l.id]), [filteredLogs, byId]);

  return {
    segments,
    byId,
    filteredSegments
  };
}

// return only segments that are in draft mode
export function useComputedDraftSegmentsOnly() {
  const { filteredSegments } = useComputedSegments();
  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();
  const { selectedWellLogIndex } = useSelectedWellLog();

  return useMemo(
    () =>
      draftMode
        ? filteredSegments.slice(Math.max(selectedWellLogIndex - nrPrevSurveysToDraft, 0), selectedWellLogIndex + 1)
        : EMPTY_ARRAY,
    [selectedWellLogIndex, nrPrevSurveysToDraft, filteredSegments, draftMode]
  );
}

const getComputedSegmentsNoPending = memoizeOne(logList => logList.reduce(reduceComputedSegment({}), []));

const getCurentComputedSegments = memoizeOne((allLogs, filteredLogs, computedSegments, draftMode) => {
  // when not in draft mode we can't just return logList
  // because dip/fault changed need to be recalculated while request is pending
  const recomputedSegmentsWithNoPendingState = getComputedSegmentsNoPending(allLogs);
  const currentComputedSegments = draftMode ? recomputedSegmentsWithNoPendingState : computedSegments;
  const computedSegmentsById = keyBy(currentComputedSegments, "id");
  const currentFilteredSegments = filteredLogs.map(l => computedSegmentsById[l.id]);
  return [currentFilteredSegments, currentComputedSegments, computedSegmentsById];
});

export function useCurrentComputedSegments() {
  const { segments } = useComputedSegments();
  const [filteredLogs, , allLogs] = useWellLogsContainer();
  const [{ draftMode }] = useComboContainer();

  return getCurentComputedSegments(allLogs, filteredLogs, segments, draftMode);
}

const recomputeLogData = (logData, log, draftLogsById, computedSegments, draft, allLogs) => {
  const logIndex = log ? allLogs.findIndex(l => l.id === log.id) : -1;
  let computedSegment = computedSegments[logIndex];
  let prevComputedSegment = computedSegments[logIndex - 1];

  if (draft) {
    computedSegment = draftLogsById[computedSegment.id];
    prevComputedSegment = prevComputedSegment && draftLogsById[prevComputedSegment.id];
  }

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
};

const recomputeLogDataFactory = memoize(logId => {
  return memoizeOne(recomputeLogData);
});

export function useGetComputedLogData(logId, draft) {
  const { wellId } = useWellIdContainer();
  const [, logsById, allLogs] = useWellLogsContainer();
  const log = logsById[logId];
  const [logData] = useWellLogData(wellId, log && log.tablename);
  const { byId: draftLogsById } = useComputedSegments();
  const [, computedSegments] = useCurrentComputedSegments();

  const recomputeLogData = recomputeLogDataFactory(logId);
  return recomputeLogData(logData, log, draftLogsById, computedSegments, draft, allLogs);
}

export function getSelectedId(selectionById) {
  return Object.keys(selectionById)[0];
}

const recomputeSurveysAndProjections = memoizeOne(
  (surveys, projections, draftMode, selectionById, pendingSegmentsState, propazm, autoPosDec) => {
    const bitProjIdx = surveys.length - 1;
    return surveys.concat(projections).reduce((acc, currSvy, index) => {
      const prevSvy = acc[index - 1];
      const selectedId = getSelectedId(selectionById);
      const pendingState = (draftMode && selectedId === currSvy.id ? {} : pendingSegmentsState[currSvy.id]) || {};
      const combinedSvy = { ...currSvy, ...pendingState };

      if (index === 0) {
        let ca = Math.PI / 2;
        if (combinedSvy.ns !== 0) {
          ca = Math.atan2(combinedSvy.ew, combinedSvy.ns);
        }
        let cd = combinedSvy.ns;
        if (ca !== 0.0) {
          cd = Math.abs(combinedSvy.ew / Math.sin(ca));
        }
        ca = toDegrees(ca);
        if (ca < 0.0) ca += 360.0;
        acc.push({
          ...combinedSvy,
          ca,
          cd
        });
      } else {
        // Perform the same formation related fault and dip calculations for both surveys and projections
        const dipPending = pendingState.dip !== undefined;
        const faultPending = pendingState.fault !== undefined;
        const dip = dipPending ? pendingState.dip : currSvy.dip;
        const fault = faultPending ? pendingState.fault : currSvy.fault;
        const totDiff = calcTot(0, dip, currSvy.vs, prevSvy.vs, fault);
        const tcl = prevSvy.tcl + totDiff;
        const tot = prevSvy.tot + totDiff;
        const bot = prevSvy.bot + totDiff;

        if (!currSvy.isProjection) {
          let dogLegSeverity = 0;
          const courseLength = combinedSvy.md - prevSvy.md;
          const pInc = toRadians(prevSvy.inc);
          const cInc = toRadians(combinedSvy.inc);
          const pAzm = toRadians(prevSvy.azm);
          let cAzm = toRadians(combinedSvy.azm);
          let dogleg = Math.acos(
            Math.cos(pInc) * Math.cos(cInc) + Math.sin(pInc) * Math.sin(cInc) * Math.cos(cAzm - pAzm)
          );
          if (isNaN(dogleg)) {
            combinedSvy.azm += 0.01;
            cAzm = toRadians(combinedSvy.azm);
            dogleg = Math.acos(
              Math.cos(pInc) * Math.cos(cInc) + Math.sin(pInc) * Math.sin(cInc) * Math.cos(cAzm - pAzm)
            );
          }
          if (courseLength > 0) {
            // TODO: include check for "depth units"
            //  https://github.com/supreme-energy/sses-main/blob/master/sses_cc/calccurve.c#L227
            dogLegSeverity = (dogleg * 100.0) / courseLength;
          }
          // Radius also called curvature factor
          let radius = 1;
          if (dogleg !== 0.0) {
            radius = (2.0 / dogleg) * Math.tan(dogleg / 2.0);
          }

          const tvd = prevSvy.tvd + (courseLength / 2.0) * (Math.cos(pInc) + Math.cos(cInc)) * radius;
          let ns =
            prevSvy.ns +
            (courseLength / 2.0) * (Math.sin(pInc) * Math.cos(pAzm) + Math.sin(cInc) * Math.cos(cAzm)) * radius;
          const ew =
            prevSvy.ew +
            (courseLength / 2.0) * (Math.sin(pInc) * Math.sin(pAzm) + Math.sin(cInc) * Math.sin(cAzm)) * radius;

          let ca = Math.PI / 2;
          if (ns !== 0.0) {
            ca = Math.atan2(ew, ns);
          }

          let cd = ns;
          if (ca !== 0.0) {
            cd = ew / Math.sin(ca);
          }

          const vs = Math.cos(ca - toRadians(propazm)) * cd;

          const caDeg = toDegrees(ca);

          acc.push({
            ...combinedSvy,
            tvd,
            vs,
            dl: toDegrees(dogLegSeverity),
            cl: courseLength,
            ca: caDeg < 0 ? caDeg + 360 : ca,
            ns,
            ew,
            build: ((cInc - pInc) * 100) / courseLength,
            turn: ((cAzm - pAzm) * 100) / courseLength,
            tcl,
            fault,
            dip,
            tot,
            bot,
            pos: tcl - tvd
          });
        } else {
          const bitProjPos = (acc[bitProjIdx] && acc[bitProjIdx].pos) || 0;
          const sign = bitProjPos > 0 ? 1 : -1;
          const cap = bitProjPos > 0 ? Math.max : Math.min;
          const pos = cap(0, bitProjPos - sign * (index - bitProjIdx) * autoPosDec);
          const projection = calculateProjection(
            { ...combinedSvy, pos, tcl, fault, dip, tot, bot },
            acc,
            index,
            propazm
          );

          if (projection) {
            acc.push(projection);
          }
        }
      }

      return acc;
    }, []);
  }
);

const groupItemsByMd = memoizeOne(items => keyBy(items, "md"));
const groupItemsById = memoizeOne(items => keyBy(items, "id"));

export function useComputedSurveysAndProjections() {
  const [{ wellInfo = {} }] = useSelectedWellInfoContainer();
  const { surveys } = useSurveysDataContainer();
  const [{ pendingSegmentsState, draftMode, selectionById }] = useComboContainer();
  const { projectionsData } = useProjectionsDataContainer();

  const surveysAndProjections = recomputeSurveysAndProjections(
    surveys,
    projectionsData,
    draftMode,
    selectionById,
    pendingSegmentsState,
    Number(wellInfo.propazm) || 0,
    Number(wellInfo.autoposdec) || 0
  );
  const computedSurveys = useMemo(() => surveysAndProjections.slice(0, surveys.length), [
    surveysAndProjections,
    surveys
  ]);

  const computedProjections = useMemo(() => surveysAndProjections.slice(surveys.length), [
    surveysAndProjections,
    surveys
  ]);

  return [
    surveysAndProjections,
    computedSurveys,
    computedProjections,
    groupItemsByMd(surveysAndProjections),
    groupItemsById(surveysAndProjections)
  ];
}

export function useSelectedSurvey() {
  const [{ selectionById }] = useComboContainer();
  const [, , , , byId] = useComputedSurveysAndProjections();
  return useMemo(() => {
    const selectedId = getSelectedId(selectionById);
    return byId[selectedId];
  }, [selectionById, byId]);
}

export function getIsDraft(index, selectedIndex, nrPrevSurveysToDraft) {
  return index <= selectedIndex && index >= selectedIndex - nrPrevSurveysToDraft;
}

const computeFormations = memoizeOne((formations, surveysAndProjections) => {
  const computedFormations = formations.map(f => {
    return {
      ...f,
      data: f.data.map((item, index) => {
        const survey = surveysAndProjections[index];

        if (!survey) {
          return item;
        }

        return {
          ...item,
          fault: survey.fault,
          vs: survey.vs,
          dip: survey.dip,
          tot: survey.tcl + item.thickness
        };
      })
    };
  });

  return computedFormations;
});

export function useComputedFormations(formations) {
  const [surveysAndProjections] = useComputedSurveysAndProjections();

  const computedFormations = computeFormations(formations, surveysAndProjections);

  return computedFormations;
}

const getSelectedFormation = memoizeOne((selectedId, formations) => {
  return formations.find(f => f.id === selectedId);
});

export function useSelectedFormation() {
  const { formationsData } = useFormationsDataContainer();
  const [{ selectedFormation }] = useFormationsStore();
  return getSelectedFormation(selectedFormation, formationsData);
}
export const getExtent = logData => (logData ? logDataExtent(logData.data) : null);

export function useLogExtent(log, wellId) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
  return getExtent(logData);
}

export function usePendingSegments() {
  const [logs] = useWellLogsContainer();
  const selectedMd = useSelectedMd();

  const [{ nrPrevSurveysToDraft, draftMode }] = useComboContainer();

  const pendingSegments = getPendingSegments(selectedMd, logs, nrPrevSurveysToDraft, draftMode);

  return pendingSegments;
}

export function useComputedPendingSegments() {
  const pendingSegments = usePendingSegments();
  const { byId } = useComputedSegments();
  return useMemo(() => pendingSegments.map(s => byId[s.id]), [byId, pendingSegments]);
}

export function useSelectedSegmentState() {
  const [{ draftMode }] = useComboContainer();
  const [, , computedSegmentsById] = useCurrentComputedSegments();
  const { byId: draftSegmentsById } = useComputedSegments();
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

const parseWellInfo = memoizeOne((wellInfo = {}) => {
  const defaultSurveyColor = "FD9E2E";
  const defaultColortot = "000000";
  const defaultDraftColor = "1F8000";

  return {
    ...wellInfo,
    selectedsurveycolor: wellInfo.selectedsurveycolor || defaultSurveyColor,
    colortot: wellInfo.colortot || defaultColortot,
    draftcolor: wellInfo.draftcolor || defaultDraftColor
  };
});

export function useSelectedWellInfoColors() {
  const [{ wellInfo }] = useSelectedWellInfoContainer();
  return parseWellInfo(wellInfo);
}

export function useSetupWizardData() {
  const [wellPlan, wPlanLoading] = useWellPlanDataContainer();
  const [controlLogs, cLogLoading] = useControlLogDataContainer();
  const [{ wellInfo }, wellInfoLoading] = useSelectedWellInfoContainer();
  const { surveys, isLoading: surveysLoading } = useSurveysDataContainer();
  const { formationsData, isLoading: formationsLoading } = useFormationsDataContainer();

  // A default empty well has one entry in the well plan
  const wellPlanIsImported = wellPlan && wellPlan.length > 1;
  const controlLogIsImported = some(controlLogs, l => l.data && l.data.length && l.startmd && l.endmd);
  const propAzmAndProjDipAreSet = wellInfo && !!Number(wellInfo.propazm) && !!Number(wellInfo.projdip);

  const tieIn = (surveys && surveys[0]) || {};
  const tieInIsCompleted =
    wellInfo && !!wellInfo.tot && !!tieIn.azm && !!tieIn.md && !!tieIn.inc && !!tieIn.ns && !!tieIn.ew;

  // Initialized Formations must have TOT, BOT, and another defined layer
  const layerNames = (formationsData && formationsData.map(l => l.label)) || [];
  const formationsAreCompleted = layerNames.includes("TOT") && layerNames.includes("BOT") && layerNames.length >= 3;

  const surveyDataIsImported = surveys && surveys.length > 1;
  const allStepsAreCompleted =
    wellPlanIsImported &&
    controlLogIsImported &&
    propAzmAndProjDipAreSet &&
    tieInIsCompleted &&
    formationsAreCompleted &&
    surveyDataIsImported;
  const dataHasLoaded = !(formationsLoading || surveysLoading || wellInfoLoading || cLogLoading || wPlanLoading);

  return {
    allStepsAreCompleted,
    dataHasLoaded,
    wellPlanIsImported,
    controlLogIsImported,
    propAzmAndProjDipAreSet,
    tieInIsCompleted,
    formationsAreCompleted,
    surveyDataIsImported
  };
}

export const logDataExtent = memoize(data => {
  return extent(data, d => Number(d.value));
});

export const getWellsGammaExtent = memoizeOne(logsData => {
  const extents = logsData.map(ld => [...logDataExtent(ld.data), ld.tablename]);
  const extentsByTableName = keyBy(extents, ([, , tablename]) => tablename);
  return [min(extents, ([min]) => min), max(extents, ([, max]) => max), extents, extentsByTableName];
});

export function getExtentWithBiasAndScale(logs, extentsByTableName) {
  return logs.reduce(
    (acc, log) => {
      const bias = Number(log.scalebias);
      const scale = Number(log.scalefactor);
      const [min, max] = (extentsByTableName && extentsByTableName[log.tablename]) || [];

      return {
        extentWithBiasAndScale: [
          Math.min(acc.extentWithBiasAndScale[0], min * scale + bias),
          Math.max(acc.extentWithBiasAndScale[1], (max - min) * scale + min + bias)
        ],
        extent: [Math.min(acc.extent[0], min), Math.max(acc.extent[1], max)]
      };
    },
    {
      extentWithBiasAndScale: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
      extent: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
    }
  );
}

export const getFilteredLogsExtent = memoizeOne(getExtentWithBiasAndScale);
export const getPendingSegmentsExtent = memoizeOne(getExtentWithBiasAndScale);

export function getColorForWellLog(colorsByWellLog, logId) {
  return colorsByWellLog[logId] || "7E7D7E";
}

export function getLastSurvey(surveys) {
  return findLast(surveys, s => Number(s.plan) === 0) || surveys[surveys.length - 1];
}

export function useLastSurvey() {
  const { surveys } = useSurveysDataContainer();
  return getLastSurvey(surveys);
}
