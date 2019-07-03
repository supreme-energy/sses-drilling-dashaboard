import React, { useMemo, useEffect, useCallback } from "react";
import { Typography, Box } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useWellLogList, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { useComboContainer } from "../ComboDashboard/containers/store";

function Interpretation({
  match: {
    params: { wellId }
  }
}) {
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogList(wellId);
  const aditionalLogs = useAdditionalDataLogsList(wellId);
  const gr = useAdditionalDataLog(wellId, aditionalLogs && aditionalLogs.GR && aditionalLogs.GR.id, true);

  const [{ selectedMd }, , { selectMd }] = useComboContainer();

  const selectedWellLog = useMemo(
    function findCurrentWellLog() {
      return (
        selectedMd &&
        logList.find(l => {
          return l.startmd >= selectedMd && selectedMd < l.endmd;
        })
      );
    },
    [logList, selectedMd]
  );

  useEffect(
    function selectFirstWellLog() {
      if (selectedMd === null && logList && logList.length) {
        selectMd(logList[0].startmd);
      }
    },
    [selectedMd, logList, selectMd]
  );

  return (
    <WidgetCard className={css.interpretationContainer}>
      <Typography variant="subtitle1">Interpretation 1</Typography>
      <InterpretationChart
        wellId={wellId}
        className={css.chart}
        controlLogs={controlLogs}
        selectedWellLog={selectedWellLog}
        gr={gr}
        logList={logList}
      />
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
