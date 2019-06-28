import React, { useState, useMemo } from "react";
import { Typography, Box } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useWellLogList, useWellLogData } from "../../api";
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

  const [currentWellLogData] = useWellLogData(wellId, selectedWellLog && selectedWellLog.tablename);

  return (
    <WidgetCard className={css.interpretationContainer}>
      <Typography variant="subtitle1">Interpretation 1</Typography>
      <Box display="flex" flexDirection="row" className="flex">
        <InterpretationChart className={css.chart} controlLogs={controlLogs} logData={currentWellLogData} />
        <Box display="flex" flexDirection="column" style={{ color: "#757575" }}>
          <IconButton className={css.upArrow}>
            <ArrowUpward />
          </IconButton>
          <IconButton>
            <ArrowDownward />
          </IconButton>
        </Box>
      </Box>
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
