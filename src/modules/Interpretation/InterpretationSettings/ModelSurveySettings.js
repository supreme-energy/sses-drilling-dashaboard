import React, { useReducer, useMemo, useRef } from "react";
import { Box, Typography, IconButton } from "@material-ui/core";
import css from "./styles.scss";
import { Add, Remove } from "@material-ui/icons";
import {
  useSelectedSegmentState,
  useComputedDraftSegmentsOnly,
  useSelectedMd,
  useComputedPendingSegments
} from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { EMPTY_FIELD } from "../../../constants/format";
import classNames from "classnames";
import { useUpdateSegmentsByMd, useSaveWellLogActions } from "../actions";
import { NumericDebouceTextField } from "../../../components/DebouncedInputs";

function PropertyField({ onChange, label, value, icon, onIncrease, onDecrease, disabled }) {
  return (
    <Box display="flex" flexDirection="row" mr={2}>
      <NumericDebouceTextField
        disabled={disabled}
        value={value}
        onChange={onChange}
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
  const [{ draftMode }] = useComboContainer();
  const selectedMd = useSelectedMd();
  const updateSegments = useUpdateSegmentsByMd();
  const [mode, toggleMode] = useReducer(
    mode => (mode === FAULT_DIP_MODE ? BIAS_SCALE_MODE : FAULT_DIP_MODE),
    FAULT_DIP_MODE
  );

  const pendingSegments = useComputedDraftSegmentsOnly();
  const computedPendingSegments = useComputedPendingSegments();
  const selectedSegment = useSelectedSegmentState();
  const firstSegment = computedPendingSegments[0];

  const { saveWellLogs } = useSaveWellLogActions();
  const fault = firstSegment && firstSegment.fault;
  const dip = selectedSegment && selectedSegment.sectdip;
  const scale = selectedSegment && selectedSegment.scalefactor;
  const bias = selectedSegment && selectedSegment.scalebias;
  const internalState = useRef({ saveWellLogs });

  // hide dip value if on draftMode pending segments have different dip values
  const hideDipValue = useMemo(() => draftMode && pendingSegments.some(s => s.sectdip !== pendingSegments[0].sectdip), [
    pendingSegments,
    draftMode
  ]);
  internalState.current.saveWellLogs = saveWellLogs;

  const title = draftMode ? "Draft Selected Surveys (and After)" : "Model Current Survey (and After)";

  const updateSegmentsHandler = props => {
    const mds = draftMode ? pendingSegments.map(s => s.endmd) : [selectedMd];
    const segmentsProps = mds.reduce((acc, md) => {
      return { ...acc, [md]: props };
    }, {});

    updateSegments(segmentsProps);
    if (!draftMode) {
      return internalState.current.saveWellLogs([selectedSegment], { [selectedSegment.endmd]: props });
    }
  };

  function updateFirstSegment(props) {
    const firstSegmentMd = firstSegment.endmd;
    updateSegments({ [firstSegmentMd]: props });

    if (!draftMode) {
      return internalState.current.saveWellLogs([firstSegment], { [firstSegment.endmd]: props });
    }
  }

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
              onChange={fault => updateFirstSegment({ fault })}
              value={fault}
              onIncrease={() => updateFirstSegment({ fault: Number(fault) + 1 })}
              onDecrease={() => updateFirstSegment({ fault: Number(fault) - 1 })}
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
              value={hideDipValue ? "" : dip}
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
