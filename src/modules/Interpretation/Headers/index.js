import React from "react";
import { Box } from "@material-ui/core";
import ControlLogHeader from "./ControlLogHeader";
import WellLogsHeader from "./WellLogsHeader";

export default function Headers({ controlLogs, logs, wellId }) {
  return (
    <Box>
      <WellLogsHeader logs={logs} wellId={wellId} color={"#0000ff"} name="GR" />
      {controlLogs.map(log => (
        <ControlLogHeader key={log.id} data={log.data} name={`GR (Control log ${log.id})`} color={"#7E7D7E"} />
      ))}
    </Box>
  );
}

Headers.defaultProps = {
  controlLogs: []
};
