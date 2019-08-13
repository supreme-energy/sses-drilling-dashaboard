import React from "react";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { TextField, Typography, Box } from "@material-ui/core";
import css from "./styles.scss";

export default function DraftSurveys(props) {
  const [{ nrPrevSurveysToDraft }, dispatch] = useComboContainer();

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <Typography className={css.title} variant="subtitle1">
        Surveys To Draft
      </Typography>
      <TextField
        value={nrPrevSurveysToDraft}
        onChange={e => dispatch({ type: "CHANGE_PREV_SURVEYS_DRAFT", nrSurveys: e.target.value })}
        type="number"
        label={"#Prior to Current"}
        className="hideArrows"
        inputProps={{ className: css.valueInput }}
        margin="dense"
        InputLabelProps={{
          shrink: true,
          className: css.noWrap
        }}
      />
    </Box>
  );
}
