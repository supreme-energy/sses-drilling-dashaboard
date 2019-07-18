import React, { useEffect } from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useWellLogList, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";

import classNames from "classnames";
import { useComboContainer } from "../ComboDashboard/containers/store";
import InterpretationSettings from "./InterpretationSettings";

function Interpretation({
  match: {
    params: { wellId }
  },
  className
}) {
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogList(wellId);
  const aditionalLogs = useAdditionalDataLogsList(wellId);
  const gr = useAdditionalDataLog(wellId, aditionalLogs && aditionalLogs.GR && aditionalLogs.GR.id, true);

  const [{ selectedMd }, , { setSelectedMd }] = useComboContainer();

  useEffect(
    function selectFirstWellLog() {
      if (selectedMd === null && logList && logList.length) {
        setSelectedMd(logList[0].startmd);
      }
    },
    [selectedMd, logList, setSelectedMd]
  );

  return (
    <WidgetCard className={classNames(css.interpretationContainer, className)} hideMenu>
      <Typography variant="subtitle1">Interpretation</Typography>
      <InterpretationChart wellId={wellId} className={css.chart} controlLogs={controlLogs} gr={gr} logList={logList} />
      <InterpretationSettings className={css.settings} />
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
