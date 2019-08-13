import React from "react";
import { Typography, Tabs, Tab, Box, TextField } from "@material-ui/core";
import css from "./styles.scss";
import { useComboContainer, surveyVisibility as visibilityOptions } from "../../ComboDashboard/containers/store";

function PreviousInput({ onClick, test, surveyVisibility, surveyPrevVisibility, dispatch }) {
  const selected = surveyVisibility === visibilityOptions.PREVIOUS_MD;

  return (
    <Box display="flex" flexDirection="column" onClick={onClick}>
      <Typography color={selected ? "primary" : undefined} variant="caption">
        CURR+PREV
      </Typography>
      <TextField
        value={surveyPrevVisibility}
        type="number"
        margin="dense"
        variant="outlined"
        InputProps={{ className: "hideArrows" }}
        classes={{ root: css.borderedInput }}
        onChange={e => {
          dispatch({ type: "CHANGE_INTERPRETATION_SURVEY_PREV_VISIBILITY", surveyPrevVisibility: e.target.value });
        }}
      />
    </Box>
  );
}
export default function VisibilitySettings(props) {
  const [{ surveyVisibility, surveyPrevVisibility }, dispatch] = useComboContainer();

  const propsFromStore = { surveyVisibility, surveyPrevVisibility, dispatch };

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <Typography className={css.title} variant="subtitle1">
        Survey Visibility
      </Typography>
      <Box display="flex" flexDirection="row">
        <Tabs
          value={surveyVisibility}
          indicatorColor="primary"
          centered
          onChange={(_, tab) => {
            dispatch({ type: "CHANGE_INTERPRETATION_SURVEY_VISIBILITY", surveyVisibility: tab });
          }}
        >
          <Tab label={"ALL"} value={visibilityOptions.ALL} className={css.tab} />
          <Tab label={"CURR"} value={visibilityOptions.CURRENT} className={css.tab} />
          <Tab
            label={"CURR"}
            value={visibilityOptions.PREVIOUS_MD}
            component={PreviousInput}
            className={css.tab}
            {...propsFromStore}
          />
        </Tabs>
      </Box>
    </Box>
  );
}
