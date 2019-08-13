import React, { useReducer } from "react";
import { Typography, Collapse, IconButton, Box, FormControlLabel, Switch } from "@material-ui/core";
import WidgetCard from "../../components/WidgetCard";
import css from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";
import { useWellControlLog, useAdditionalDataLogsList, useAdditionalDataLog } from "../../api";
import { withRouter } from "react-router";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InterpretationSettings from "./InterpretationSettings";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";
import { useComboContainer } from "../ComboDashboard/containers/store";
import SelectionStatsContainer from "./SelectionStats";

function Interpretation({
  match: {
    params: { wellId }
  },
  className
}) {
  const [controlLogs] = useWellControlLog(wellId);
  const [logList] = useWellLogsContainer();
  const { dataBySection: aditionalLogs = {} } = useAdditionalDataLogsList(wellId);
  const gr = useAdditionalDataLog(wellId, aditionalLogs && aditionalLogs.GR && aditionalLogs.GR.id, true);
  const [expanded, toggleExpanded] = useReducer(e => !e, false);
  const [state, dispatch] = useComboContainer();
  const { draftMode } = state;
  return (
    <WidgetCard className={classNames(css.interpretationContainer, className)} hideMenu>
      <Typography variant="subtitle1">Interpretation</Typography>
      <SelectionStatsContainer />
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Draft Current</Typography>
        <FormControlLabel
          classes={{ root: css.label }}
          value="Toggle Layer (L)"
          control={
            <Switch color="secondary" checked={draftMode} onChange={() => dispatch({ type: "TOGGLE_DRAFT_MODE" })} />
          }
          label="Toggle Layer (L)"
          labelPlacement="end"
        />
      </Box>
      <InterpretationChart wellId={wellId} className={css.chart} controlLogs={controlLogs} gr={gr} logList={logList} />
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
      <Collapse in={expanded}>
        <InterpretationSettings className={css.settings} />
      </Collapse>
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
