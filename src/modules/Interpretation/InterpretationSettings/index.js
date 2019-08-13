import React from "react";
import { Box, FormControlLabel, Switch, Typography } from "@material-ui/core";
import css from "./styles.scss";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import VisibilitySettings from "./VisibilitySettings";
import classNames from "classnames";

export default function InterpretationSettings({ className }) {
  const [state, dispatch] = useComboContainer();
  const { draftMode } = state;
  return (
    <Box display="flex" flexDirection="column" className={classNames(className, css.root)}>
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
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <VisibilitySettings className="flex" />
      </Box>
    </Box>
  );
}
