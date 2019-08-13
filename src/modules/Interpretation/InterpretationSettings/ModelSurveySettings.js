import React, { useReducer } from "react";
import { Box, Typography, TextField, IconButton } from "@material-ui/core";
import css from "./styles.scss";
import { Add, Remove } from "@material-ui/icons";
import { useSelectedSegmentState, usePendingSegments } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { EMPTY_FIELD } from "../../../constants/format";
import classNames from "classnames";
import { useSaveWellLogActions } from "../actions";

function PropertyField({ onChange, label, value, icon, onIncrease, onDecrease, disabled }) {
  return (
    <Box display="flex" flexDirection="row" mr={2}>
      <TextField
        disabled={disabled}
        value={value}
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

function SegmentIcon({ mode }) {
  return <div className={classNames(css.segmentIcon, { [css.rotated]: mode === BIAS_SCALE_MODE })} />;
}

const FAULT_DIP_MODE = "Fault /Dip";
const BIAS_SCALE_MODE = "Scale /Bias";

export default function ModelSurveySettings(props) {
  const [{ selectedMd, draftMode }, , { updateSegments }] = useComboContainer();
  const [mode, toggleMode] = useReducer(
    mode => (mode === FAULT_DIP_MODE ? BIAS_SCALE_MODE : FAULT_DIP_MODE),
    FAULT_DIP_MODE
  );

  const pendingSegments = usePendingSegments();
  const selectedSegment = useSelectedSegmentState();
  const { saveSelectedWellLog } = useSaveWellLogActions();
  const fault = selectedSegment && selectedSegment.fault;
  const dip = selectedSegment && selectedSegment.sectdip;
  const scale = selectedSegment && selectedSegment.scalefactor;
  const bias = selectedSegment && selectedSegment.scalebias;

  const title = draftMode ? "Draft Selected Surveys (and After)" : "Model Current Survey (and After)";
  const updateSegmentsHandler = props => {
    const mds = draftMode ? pendingSegments.map(s => s.endmd) : [selectedMd];
    const segmentsProps = mds.reduce((acc, md) => {
      return { ...acc, [md]: props };
    }, {});

    updateSegments(segmentsProps);
    if (!draftMode) {
      saveSelectedWellLog();
    }
  };

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <Typography className={css.title} variant="subtitle1">
        {title}
      </Typography>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="row">
          {mode === FAULT_DIP_MODE ? (
            <PropertyField
              label={"Fault"}
              disabled={!selectedSegment}
              onChange={fault => updateSegmentsHandler({ fault })}
              value={fault}
              onIncrease={() => updateSegmentsHandler({ fault: Number(fault) + 1 })}
              onDecrease={() => updateSegmentsHandler({ fault: Number(fault) - 1 })}
            />
          ) : (
            <PropertyField
              label={"Scale"}
              disabled={!selectedSegment}
              onChange={scale => updateSegmentsHandler({ scale })}
              value={scale}
              onIncrease={() => updateSegmentsHandler({ scale: Number(scale) + 0.1 })}
              onDecrease={() => updateSegmentsHandler({ scale: Number(scale) - 0.1 })}
            />
          )}
          {mode === FAULT_DIP_MODE ? (
            <PropertyField
              label={"Dip"}
              disabled={!selectedSegment}
              onChange={dip => updateSegmentsHandler({ dip })}
              value={dip}
              onIncrease={() => updateSegmentsHandler({ dip: Number(dip) + 1 })}
              onDecrease={() => updateSegmentsHandler({ dip: Number(dip) - 1 })}
            />
          ) : (
            <PropertyField
              label={"Bias"}
              disabled={!selectedSegment}
              onChange={bias => updateSegmentsHandler({ bias })}
              value={bias}
              onIncrease={() => updateSegmentsHandler({ bias: Number(bias) + 1 })}
              onDecrease={() => updateSegmentsHandler({ bias: Number(bias) - 1 })}
            />
          )}
        </Box>
        <Box
          alignSelf="flex-end"
          display="flex"
          flexDirection="column"
          alignItems="center"
          className={css.switchButton}
          onClick={toggleMode}
        >
          <SegmentIcon mode={mode} />
          <Typography variant="caption">{mode === BIAS_SCALE_MODE ? FAULT_DIP_MODE : BIAS_SCALE_MODE}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
