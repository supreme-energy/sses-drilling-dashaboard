import React from "react";
import { Box, Typography, TextField, IconButton } from "@material-ui/core";
import css from "./styles.scss";
import { Add, Remove } from "@material-ui/icons";
import { useSelectedSegmentState } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { EMPTY_FIELD } from "../../../constants/format";

function PropertyField({ onChange, label, value, icon, onIncrease, onDecrease, disabled }) {
  return (
    <Box display="flex" flexDirection="row" mr={2}>
      <TextField
        disabled={disabled}
        value={Number.isNaN(value) ? EMPTY_FIELD : value}
        onChange={e => onChange(e.target.value)}
        type="number"
        placeholder={EMPTY_FIELD}
        label={label}
        className="hideArrows"
        inputProps={{ className: css.valueInput }}
        margin="dense"
        InputLabelProps={{
          shrink: true
        }}
      />
      <Box display="flex" flexDirection="column" ml={1}>
        <IconButton size="small" onClick={onIncrease} disabled={disabled}>
          <Add />
        </IconButton>
        <IconButton size="small" onClick={onDecrease} disabled={disabled}>
          <Remove />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function ModelSurveySettings(props) {
  const [{ selectedMd }, , { updateSegment }] = useComboContainer();
  const selectedSegment = useSelectedSegmentState();
  const fault = Number(selectedSegment && selectedSegment.fault);
  const dip = Number(selectedSegment && selectedSegment.sectdip);

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <Typography className={css.title} variant="subtitle1">
        Model Current Survey (and After)
      </Typography>
      <Box display="flex" flexDirection="row">
        <PropertyField
          label="Fault"
          disabled={!selectedSegment}
          onChange={fault => updateSegment({ fault }, selectedMd)}
          value={fault}
          onIncrease={() => updateSegment({ fault: fault + 1 }, selectedMd)}
          onDecrease={() => updateSegment({ fault: fault - 1 }, selectedMd)}
        />
        <PropertyField
          label="Dip"
          disabled={!selectedSegment}
          onChange={dip => updateSegment({ dip }, selectedMd)}
          value={dip}
          onIncrease={() => updateSegment({ dip: dip + 1 }, selectedMd)}
          onDecrease={() => updateSegment({ dip: dip - 1 }, selectedMd)}
        />
      </Box>
    </Box>
  );
}
