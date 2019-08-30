import React, { useReducer } from "react";
import { Typography, Collapse, IconButton, Box, FormControlLabel, Switch } from "@material-ui/core";
import WidgetCard from "../../components/WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";
import classNames from "classnames";
import CloudServerModal from "./components/CloudServerModal";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InterpretationSettings from "./InterpretationSettings";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import { useComboContainer } from "../ComboDashboard/containers/store";
import SelectionStatsContainer from "./SelectionStats";
import { LogExtentProvider } from "./containers/logExtentContainer";
import TCLValue from "./SelectionStats/TCLValue";
import Headers from "./Headers";
import { useWellIdContainer } from "../App/Containers";

const Interpretation = React.memo(({ wellId, className, draftMode, dispatch, controlLogs, logList }) => {
  const [expanded, toggleExpanded] = useReducer(e => !e, false);
  return (
    <LogExtentProvider>
      <WidgetCard className={classNames(css.interpretationContainer, className)} title="Interpretation" hideMenu>
        <CloudServerModal wellId={wellId} />
        <SelectionStatsContainer />
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
      </WidgetCard>
    </LogExtentProvider>
  );
});

const InterpretatinContainer = props => {
  const { wellId } = useWellIdContainer();
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogsContainer();

  const [state, dispatch] = useComboContainer();
  const { draftMode } = state;

  return (
    <Interpretation
      {...props}
      controlLogs={controlLogs}
      logList={logList}
      dispatch={dispatch}
      draftMode={draftMode}
      wellId={wellId}
    />
  );
};

export default InterpretatinContainer;
