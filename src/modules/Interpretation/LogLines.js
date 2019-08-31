import React, { useMemo } from "react";
import LogDataLine from "./InterpretationChart/LogDataLine";
import { useInterpretationRenderer } from "./InterpretationChart";
import { useComboContainer, surveyVisibility as visibilityOptions } from "../ComboDashboard/containers/store";
import { getIsDraft } from "./selectors";

export default function LogLines({ logList, wellId, selectedWellLogIndex, container }) {
  const [{ surveyVisibility, surveyPrevVisibility, draftMode, nrPrevSurveysToDraft }] = useComboContainer();
  const { refresh } = useInterpretationRenderer();
  const selectedWellLog = logList[selectedWellLogIndex];
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
