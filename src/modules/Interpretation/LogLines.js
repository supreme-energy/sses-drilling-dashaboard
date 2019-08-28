import React, { useMemo, useRef, useEffect } from "react";
import LogDataLine from "./InterpretationChart/LogDataLine";
import { useInterpretationRenderer } from "./InterpretationChart";
import { useComboContainer, surveyVisibility as visibilityOptions } from "../ComboDashboard/containers/store";
import { getIsDraft, useComputedDraftSegmentsOnly } from "./selectors";
import { useTimeSliderContainer } from "../App/Containers";

export default function LogLines({ logList, wellId, selectedWellLogIndex, container }) {
  const [{ surveyVisibility, surveyPrevVisibility, draftMode, nrPrevSurveysToDraft }, dispatch] = useComboContainer();
  const { refresh } = useInterpretationRenderer();
  const selectedWellLog = logList[selectedWellLogIndex];
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

    return logList;
  }, [logList, selectedWellLog, surveyVisibility]);

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

  return (
    <React.Fragment>
      {filteredLogList.map((log, index) => {
        const draft = draftMode && getIsDraft(index, selectedWellLogIndex, nrPrevSurveysToDraft);
        return (
          <LogDataLine
            draft={draft}
            range={range}
            refresh={refresh}
            log={log}
            key={log.id}
            wellId={wellId}
            container={container}
            selected={selectedWellLog && log.id === selectedWellLog.id}
          />
        );
      })}
    </React.Fragment>
  );
}
