import React, { useCallback, useReducer, useMemo } from "react";
import { Box } from "@material-ui/core";
import ControlLogHeader from "./ControlLogHeader";
import WellLogsHeader from "./WellLogsHeader";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { getColorForWellLog } from "../selectors";
import { AddCircle } from "@material-ui/icons";
import ControlLogImportModal from "../../../modals/ControlLogImporterModal";
import CloudServerModal from "../components/CloudServerModal";
import classes from "./styles.scss";

const Headers = React.memo(
  ({
    controlLogs,
    logs,
    wellId,
    changeCurrentEditedLog,
    currentEditedLog,
    activeLog,
    changeActiveLog,
    changeLogColor,
    colorsByWellLog
  }) => {
    const [showImporter, toggleImporter] = useReducer(b => !b);
    const onClose = () => {
      changeActiveLog(null);
    };

    const logIds = useMemo(() => ["wellLogs", ...controlLogs.map(l => l.id)], [controlLogs]);
    const getNextLog = useCallback(
      (activeLog, step) => {
        const index = logIds.indexOf(activeLog);
        let nextIndex = index + step;
        if (nextIndex === -1) {
          nextIndex = logIds.length - 1;
        }

        if (nextIndex === logIds.length) {
          nextIndex = 0;
        }

        return logIds[nextIndex];
      },
      [logIds]
    );

    const handleEditScale = useCallback(
      logId => {
        changeCurrentEditedLog(logId);
        changeActiveLog(null);
      },
      [changeCurrentEditedLog, changeActiveLog]
    );

    const onNextClick = () => changeActiveLog(getNextLog(activeLog, 1));
    const onPrevClick = () => changeActiveLog(getNextLog(activeLog, -1));

    const headerProps = {
      onNextClick,
      onPrevClick,
      onClose,
      handleEditScale,
      onChangeColor: changeLogColor
    };
    return (
      <Box>
        <WellLogsHeader
          logs={logs}
          wellId={wellId}
          menuIcon={
            !logs.length && (
              <CloudServerModal wellId={wellId} importIcon={<AddCircle />} className={classes.importModalPlusButton} />
            )
          }
          color={`#${getColorForWellLog(colorsByWellLog, "wellLogs")}`}
          name="GR"
          logId={"wellLogs"}
          isActive={activeLog === "wellLogs"}
          onMenuClick={() => logs.length && changeActiveLog("wellLogs")}
          {...headerProps}
        />
        {controlLogs.map(log => (
          <ControlLogHeader
            key={log.id}
            logId={log.id}
            data={log.data}
            name={`GR (Control log ${log.id})`}
            color={`#${getColorForWellLog(colorsByWellLog, log.id)}`}
            isActive={activeLog === log.id}
            onMenuClick={() => changeActiveLog(log.id)}
            {...headerProps}
          />
        ))}
        {!controlLogs.length && (
          <ControlLogHeader
            name="Add Control Gamma"
            color={"#7e7d7e"}
            menuIcon={<AddCircle />}
            onMenuClick={toggleImporter}
          />
        )}
        <ControlLogImportModal isVisible={showImporter} handleClose={toggleImporter} />
      </Box>
    );
  }
);

const initialState = { activeLog: null };
function headersReducer(state, action) {
  switch (action.type) {
    case "CHANGE_ACTIVE_LOG":
      return {
        ...state,
        activeLog: action.log
      };

    default:
      throw new Error("action not available");
  }
}
export default React.memo(props => {
  const [{ currentEditedLog, colorsByWellLog }, dispatch] = useComboContainer();
  const changeCurrentEditedLog = useCallback(logId => dispatch({ type: "CHANGE_CURRENT_EDITED_LOG", logId }), [
    dispatch
  ]);
  const changeLogColor = useCallback(
    ({ logId, hex }) => dispatch({ type: "CHANGE_LOG_COLOR", logId, color: hex.replace("#", "") }),
    [dispatch]
  );

  const [{ activeLog }, dispatchHeaders] = useReducer(headersReducer, initialState);
  const changeActiveLog = useCallback(log => dispatchHeaders({ type: "CHANGE_ACTIVE_LOG", log }), [dispatchHeaders]);
  const logProps = {
    changeCurrentEditedLog,
    currentEditedLog,
    changeActiveLog,
    activeLog,
    changeLogColor,
    colorsByWellLog
  };

  return <Headers {...props} {...logProps} />;
});

Headers.defaultProps = {
  controlLogs: []
};
