import React, { useMemo } from "react";

import WidgetCard from "../../components/WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useWellLogList, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";
import { useComboContainer } from "../App/Containers";
import classNames from "classnames";

function Interpretation({
  match: {
    params: { wellId }
  },
  className
}) {
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogList(wellId);
  const { dataBySection: aditionalLogs = {} } = useAdditionalDataLogsList(wellId);
  const gr = useAdditionalDataLog(wellId, aditionalLogs && aditionalLogs.GR && aditionalLogs.GR.id, true);

  const [{ selectedMd }] = useComboContainer();

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

  return (
    <WidgetCard className={classNames(css.interpretationContainer, className)} title="Interpretation" hideMenu>
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
