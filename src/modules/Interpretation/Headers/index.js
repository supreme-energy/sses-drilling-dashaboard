import React, { useCallback } from "react";
import { Box } from "@material-ui/core";
import ControlLogHeader from "./ControlLogHeader";
import WellLogsHeader from "./WellLogsHeader";
import { useCrossSectionContainer } from "../../App/Containers";
import { useComboContainer } from "../../ComboDashboard/containers/store";

const Headers = React.memo(({ controlLogs, logs, wellId, changeCurrentEditedLog }) => {
  return (
    <Box>
      <WellLogsHeader
        logs={logs}
        wellId={wellId}
        color={"#0000ff"}
        name="GR"
        onClick={() => changeCurrentEditedLog("wellLogs")}
      />
      {controlLogs.map(log => (
        <ControlLogHeader
          key={log.id}
          data={log.data}
          name={`GR (Control log ${log.id})`}
          color={"#7E7D7E"}
          onClick={() => changeCurrentEditedLog(log.id)}
        />
      ))}
    </Box>
  );
});

export default function HeadersContainer(props) {
  const [{ currentEditedLog, logsBiasAndScale }, dispatch] = useComboContainer();
  const changeCurrentEditedLog = useCallback(
    logId => dispatch({ type: "CHANGE_CURRENT_EDITED_LOG", logId: currentEditedLog === logId ? null : logId }),
    [dispatch, currentEditedLog]
  );

  return <Headers {...props} changeCurrentEditedLog={changeCurrentEditedLog} />;
}

Headers.defaultProps = {
  controlLogs: []
};
