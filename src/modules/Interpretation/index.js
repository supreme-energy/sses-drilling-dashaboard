import React, { useReducer } from "react";
import { Typography, Collapse, IconButton } from "@material-ui/core";
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

  return (
    <WidgetCard className={classNames(css.interpretationContainer, className)} title="Interpretation" hideMenu>
      <CloudServerModal wellId={wellId} />
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
        <Typography variant="subtitle1">Modeling Controls</Typography>
      </div>
      <Collapse in={expanded} unmountOnExit>
        <InterpretationSettings className={css.settings} />
      </Collapse>
    </WidgetCard>
  );
}

export default withRouter(Interpretation);
