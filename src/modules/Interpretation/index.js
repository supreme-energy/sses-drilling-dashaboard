import React, { useReducer, useCallback, useMemo } from "react";
import { Typography, Collapse, IconButton, Box, FormControlLabel, Switch, Button } from "@material-ui/core";
import WidgetCard, { WidgetTitle } from "../../components/WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import classNames from "classnames";
import CloudServerModal from "./components/CloudServerModal";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InterpretationSettings from "./InterpretationSettings";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import { useComboContainer } from "../ComboDashboard/containers/store";
import SelectionStatsContainer from "./SelectionStats";
import TCLValue from "./SelectionStats/TCLValue";
import Headers from "./Headers";
import { useControlLogDataContainer, useWellIdContainer } from "../App/Containers";
import LogSettings from "./LogSettings";
import { useFormationsStore } from "./InterpretationChart/Formations/store";
import FormationControls from "./InterpretationSettings/FormationControls";
import { useSelectedWellLog, useSetupWizardData } from "./selectors";
import FormationSettings from "./InterpretationChart/FormationSettings";

import WizardChecklist from "./components/WizardChecklist";
import DetailsTable from "./DetailsTable";

function TopsButton() {
  const [, dispatch] = useFormationsStore();
  const { selectedWellLog } = useSelectedWellLog();
  return (
    <Button
      variant="text"
      color="primary"
      onClick={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
      disabled={!selectedWellLog}
    >
      Tops
    </Button>
  );
}

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
    changeCurrentEditedLog,
    formationsEditMode
  }) => {
    const [expanded, toggleExpanded] = useReducer(e => !e, false);
    const logSettingsProps = {
      resetLogBiasAndScale,
      changeCurrentEditedLog,
      currentEditedLog,
      logsBiasAndScale
    };
    const showFormationControls = formationsEditMode;
    const showLogSettings = !formationsEditMode && currentEditedLog;
    const showInterpretationSettings = !formationsEditMode && !currentEditedLog;
    const { dataHasLoaded, allStepsAreCompleted, ...setupSteps } = useSetupWizardData();

    return (
      <WidgetCard
        className={classNames(css.interpretationContainer, className)}
        hideMenu
        renderHeader={() => (
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <WidgetTitle>Interpretation</WidgetTitle>
            <Box display="flex">
              <CloudServerModal wellId={wellId} />
              <DetailsTable />
            </Box>
          </Box>
        )}
      >
        {formationsEditMode ? (
          <FormationSettings />
        ) : (
          <React.Fragment>
            {dataHasLoaded ? (
              allStepsAreCompleted ? (
                <SelectionStatsContainer logs={logList} wellId={wellId} />
              ) : (
                <WizardChecklist {...setupSteps} />
              )
            ) : null}
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
              <TopsButton variant="text" color="primary">
                Tops
              </TopsButton>
            </Box>
          </React.Fragment>
        )}
        <Headers controlLogs={controlLogs} logs={logList} wellId={wellId} />

        <InterpretationChart wellId={wellId} className={css.chart} controlLogs={controlLogs} logList={logList} />
        {showFormationControls && <FormationControls />}
        {showLogSettings && <LogSettings {...logSettingsProps} />}
        {showInterpretationSettings && (
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

const InterpretationContainer = React.memo(props => {
  const { wellId } = useWellIdContainer();
  const [controlLogs] = useControlLogDataContainer();
  const cLogsFiltered = useMemo(() => controlLogs.filter(l => l.data.length && l.endmd && l.startmd), [controlLogs]);
  const [logList] = useWellLogsContainer();
  const [{ editMode: formationsEditMode }] = useFormationsStore();
  const [{ currentEditedLog, logsBiasAndScale, draftMode }, dispatch] = useComboContainer();
  const resetLogBiasAndScale = useCallback(logId => dispatch({ type: "RESET_LOG_BIAS_AND_SCALE", logId }), [dispatch]);
  const changeCurrentEditedLog = useCallback(
    logId => dispatch({ type: "CHANGE_CURRENT_EDITED_LOG", logId: currentEditedLog === logId ? null : logId }),
    [dispatch, currentEditedLog]
  );
  const interpretationProps = {
    controlLogs: cLogsFiltered,
    logList,
    dispatch,
    draftMode,
    wellId,
    currentEditedLog,
    logsBiasAndScale,
    resetLogBiasAndScale,
    changeCurrentEditedLog,
    formationsEditMode
  };
  return <Interpretation {...props} {...interpretationProps} />;
});

export default InterpretationContainer;
