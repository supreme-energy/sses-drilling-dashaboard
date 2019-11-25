import React, { useMemo, useRef, useEffect } from "react";
import LogDataLine from "./InterpretationChart/LogDataLine";
import { useInterpretationRenderer } from "./InterpretationChart";
import { useComboContainer, surveyVisibility as visibilityOptions } from "../ComboDashboard/containers/store";
import {
  getIsDraft,
  useComputedDraftSegmentsOnly,
  getFilteredLogsExtent,
  getColorForWellLog,
  useComputedSegments
} from "./selectors";
import { useTimeSliderContainer } from "../App/Containers";
import { withWellLogsData, EMPTY_ARRAY } from "../../api";
import { computeLineBiasAndScale } from "../../utils/lineBiasAndScale";
import PixiContainer from "../../components/PixiContainer";

function LogLines({ logs, wellId, selectedWellLogIndex, container, data: { result }, offset }) {
  const [
    { surveyVisibility, surveyPrevVisibility, draftMode, nrPrevSurveysToDraft, logsBiasAndScale, colorsByWellLog },
    dispatch
  ] = useComboContainer();
  const {
    refresh,
    view,
    size: { height }
  } = useInterpretationRenderer();
  const selectedWellLog = logs[selectedWellLogIndex];
  const internalState = useRef({ prevFirstDraft: null });

  const range = useMemo(() => {
    if (
      surveyVisibility === visibilityOptions.ALL ||
      surveyVisibility === visibilityOptions.CURRENT ||
      !selectedWellLog
    ) {
      return null;
    }

    return [selectedWellLog.startmd - surveyPrevVisibility, selectedWellLog.endmd];
  }, [selectedWellLog, surveyPrevVisibility, surveyVisibility]);

  const filteredLogList = useMemo(() => {
    if (surveyVisibility === visibilityOptions.CURRENT && selectedWellLog) {
      return [selectedWellLog];
    }

    return logs;
  }, [logs, selectedWellLog, surveyVisibility]);

  const draftSegments = useComputedDraftSegmentsOnly();
  const [firstDraft] = draftSegments;

  const { sliderInterval } = useTimeSliderContainer();

  useEffect(() => {
    const prevFirstDraft = internalState.current.prevFirstDraft;
    // switch prev firstSegment fault state to next firstSegment since we need fault to be
    // always on the first segment. This need to happen when first segment is changed because of
    // filtering to preserve draft consistency
    if (draftMode && prevFirstDraft && firstDraft.id !== prevFirstDraft.id) {
      internalState.current.prevFirstDraft = firstDraft;
      dispatch({
        type: "UPDATE_SEGMENTS_PROPERTIES",
        propsById: {
          [firstDraft.id]: { fault: prevFirstDraft.fault },
          [prevFirstDraft.id]: { fault: undefined }
        }
      });
    }
  }, [sliderInterval, draftMode, firstDraft, dispatch]);

  const { bias, scale } = logsBiasAndScale.wellLogs || { bias: 1, scale: 1 };
  const logsGammaExtent = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const [, , , extentsByTableName] = logsGammaExtent;

  const extent = getFilteredLogsExtent(logs, extentsByTableName).extentWithBiasAndScale;
  const [, pixiScale] = useMemo(() => computeLineBiasAndScale(bias, scale, extent), [bias, scale, extent]);
  const logColor = Number(`0x${getColorForWellLog(colorsByWellLog, "wellLogs")}`);
  const { byId } = useComputedSegments();
  const yMin = Math.floor((-1 * view.y) / view.yScale);
  const yMax = yMin + Math.floor((height + view.yScale) / view.yScale);

  return (
    <PixiContainer
      x={bias}
      scale={pixiScale}
      container={container}
      child={container =>
        filteredLogList.map((log, index) => {
          const draft = draftMode && getIsDraft(index, selectedWellLogIndex, nrPrevSurveysToDraft);
          const computedLog = byId[log.id];
          const selected = selectedWellLog && log.id === selectedWellLog.id;
          const logMin = Math.min(computedLog.startdepth, computedLog.enddepth);
          const logMax = Math.max(computedLog.startdepth, computedLog.enddepth);
          if (!selected && (logMin > yMax || logMax < yMin)) {
            return null;
          }

          return (
            <LogDataLine
              draft={draft}
              range={range}
              parentScale={scale}
              refresh={refresh}
              log={log}
              logColor={logColor}
              key={log.id}
              wellId={wellId}
              container={container}
              selected={selected}
            />
          );
        })
      }
    />
  );
}

export default withWellLogsData(LogLines);
