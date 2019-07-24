import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useWellLogList, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";

import classNames from "classnames";

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

  return (
    <WidgetCard className={classNames(css.interpretationContainer, className)} hideMenu>
      <Typography variant="subtitle1">Interpretation 1</Typography>
      <InterpretationChart wellId={wellId} className={css.chart} controlLogs={controlLogs} gr={gr} logList={logList} />
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
