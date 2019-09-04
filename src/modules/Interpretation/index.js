import React, { useReducer, useCallback } from "react";
import { Typography, Collapse, IconButton, Box, FormControlLabel, Switch } from "@material-ui/core";
import WidgetCard from "../../components/WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog } from "../../api";
import classNames from "classnames";
import CloudServerModal from "./components/CloudServerModal";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InterpretationSettings from "./InterpretationSettings";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import { useComboContainer } from "../ComboDashboard/containers/store";
import SelectionStatsContainer from "./SelectionStats";
import TCLValue from "./SelectionStats/TCLValue";
import Headers from "./Headers";
import { useWellIdContainer } from "../App/Containers";
import LogSettings from "./LogSettings";

const Interpretation = React.memo(
  ({
    wellId,
    className,
    draftMode,
    dispatch,
    controlLogs,
    logList,
    currentEditedLog,
    logsBiasAndScale,
    resetLogBiasAndScale,
    changeCurrentEditedLog
  }) => {
    const [expanded, toggleExpanded] = useReducer(e => !e, false);
    const logSettingsProps = {
      resetLogBiasAndScale,
      changeCurrentEditedLog,
      currentEditedLog,
      logsBiasAndScale
    };
    return (
      <WidgetCard className={classNames(css.interpretationContainer, className)} title="Interpretation" hideMenu>
        <CloudServerModal wellId={wellId} />
        <SelectionStatsContainer logs={logList} wellId={wellId} />
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box display="flex" flexDirection="row" alignItems="center">
            <TCLValue />
            <FormControlLabel
              classes={{ root: css.switchLabel }}
              value="start"
              control={
                <Switch
                  color="secondary"
                  checked={draftMode}
                  onChange={() => dispatch({ type: "TOGGLE_DRAFT_MODE" })}
                />
              }
              label="Draft (D)"
              labelPlacement="start"
            />
          </Box>
          {/* Todo: add formations top here */}
        </Box>
        <Headers controlLogs={controlLogs} logs={logList} wellId={wellId} />

        <InterpretationChart wellId={wellId} className={css.chart} controlLogs={controlLogs} logList={logList} />

        {currentEditedLog ? (
          <LogSettings {...logSettingsProps} />
        ) : (
          <React.Fragment>
            <div className="layout horizontal">
              <IconButton
                size="small"
                className={classNames(css.expand, {
                  [css.expandOpen]: expanded
                })}
                onClick={toggleExpanded}
                aria-expanded={expanded}
                aria-label="Show more"
                mr={1}
              >
                <ExpandMoreIcon />
              </IconButton>
              <Typography variant="subtitle1">{draftMode ? "Drafting Controls" : "Modeling Controls"}</Typography>
            </div>
            <Collapse in={expanded} unmountOnExit>
              <InterpretationSettings className={css.settings} />
            </Collapse>
          </React.Fragment>
        )}
      </WidgetCard>
    );
  }
);

const InterpretatinContainer = props => {
  const { wellId } = useWellIdContainer();
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogsContainer();

  const [{ currentEditedLog, logsBiasAndScale, draftMode }, dispatch] = useComboContainer();
  const resetLogBiasAndScale = useCallback(logId => dispatch({ type: "RESET_LOG_BIAS_AND_SCALE", logId }), [dispatch]);
  const changeCurrentEditedLog = useCallback(
    logId => dispatch({ type: "CHANGE_CURRENT_EDITED_LOG", logId: currentEditedLog === logId ? null : logId }),
    [dispatch, currentEditedLog]
  );
  const interpretationProps = {
    controlLogs,
    logList,
    dispatch,
    draftMode,
    wellId,
    currentEditedLog,
    logsBiasAndScale,
    resetLogBiasAndScale,
    changeCurrentEditedLog
  };
  return <Interpretation {...props} {...interpretationProps} />;
};

export default InterpretatinContainer;
