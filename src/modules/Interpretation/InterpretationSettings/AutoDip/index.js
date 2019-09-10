import React, { useReducer, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Button,
  Tab,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import css from "../styles.scss";

import classNames from "classnames";
import { Tune, Close, AddCircle } from "@material-ui/icons";
import { useWellControlLogList, useWellPath, EMPTY_ARRAY } from "../../../../api";
import { useWellIdContainer, useSurveysDataContainer } from "../../../App/Containers";
import { toRadians } from "../../../ComboDashboard/components/CrossSection/formulas";
import { twoDecimals } from "../../../../constants/format";
import uniqueId from "lodash/uniqueId";
import calculateAverageDip from "./calculateControlDipClosure";
import memoizeOne from "memoize-one";
import { mean } from "d3-array";
import { useUpdateSegmentsByMd, useSaveWellLogActions } from "../../actions";
import { useSelectedSegmentState } from "../../selectors";

export const NORMAL = "NORMAL";
export const CALCULATED = "CALCULATED";

const methodTypes = {
  AVERAGE_DIP: "Average Dip",
  AVERAGE_CONTROL_DIP_CLOSURE: "Average Control Dip-Closure",
  MANUAL_INPUT: "Manual Input",
  AVERAGE_REAL_DIP_CLOSURE: "Average Real Dip-Closure"
};

const initialState = {
  dipMode: NORMAL,
  settingsOpened: false,
  rowsById: {},
  manualValue: 0
};

function autoDipReducer(state, action) {
  switch (action.type) {
    case "CHANGE_DIP_MODE":
      return {
        ...state,
        dipMode: action.mode
      };

    case "CHANGE_MANUAL_VALUE":
      return {
        ...state,
        manualValue: action.manualValue
      };

    case "TOGGLE_SETTINGS":
      return {
        ...state,
        settingsOpened: !state.settingsOpened
      };
    case "ADD_NEW_ROW": {
      const id = uniqueId();
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [id]: {
            id,
            calculationMethod: methodTypes.MANUAL_INPUT,
            nrSurveysBack: 2
          }
        }
      };
    }
    case "DELETE_ROW": {
      const { rowsById } = state;
      delete rowsById[action.id];

      return {
        ...state,
        rowsById: {
          ...rowsById
        }
      };
    }
    case "UPDATE_ROW":
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.id]: {
            ...state.rowsById[action.id],
            [action.field]: action.value
          }
        }
      };
    default:
      return state;
  }
}

const ColumnHead = props => <Typography displayBlock variant={"caption"} {...props} />;

function MethodTypeDropDown(props) {
  return (
    <FormControl className={classNames(css.col, css.col1)}>
      <InputLabel htmlFor="method-type">Average Dip</InputLabel>
      <Select
        {...props}
        inputProps={{
          name: "method type",
          id: "method-type"
        }}
      >
        {Object.values(methodTypes).map(v => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function SurveysBackDropDown({ nrSurveys, ...props }) {
  return (
    <FormControl className={classNames(css.col, css.col3, "self-end")}>
      <Select {...props}>
        {new Array(nrSurveys)
          .fill()
          .map((_, index) => ({ value: index }))
          .slice(2)
          .map(({ value }) => (
            <MenuItem value={value}>{value}</MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}

SurveysBackDropDown.defaultProps = {
  nrSurveys: 3
};

function DipValueInput(props) {
  return <TextField {...props} classes={{ root: css.valueInput }} className={classNames(css.col, css.col4)} />;
}

function AverageDipRow({ row, options, onDelete, onMethodChange, onStartChange, onNrSurveysBackChange }) {
  const average = useMemo(() => calculateAverageDip(row.startIndex, row.nrSurveysBack, options), [options, row]);

  return (
    <Box display="flex" mb={1}>
      <MethodTypeDropDown value={row.calculationMethod} onChange={onMethodChange} />
      <Select value={row.startIndex} onChange={onStartChange} className={classNames(css.col, css.col2)}>
        {options.map((s, index) => (
          <MenuItem key={s.md} disabled={index === options.length - 1} value={index}>{`${s.md} (${twoDecimals(
            s.dip
          )})`}</MenuItem>
        ))}
      </Select>
      <SurveysBackDropDown nrSurveys={options.length} value={row.nrSurveysBack} onChange={onNrSurveysBackChange} />
      <DipValueInput disabled value={average} />
      <IconButton onClick={onDelete}>
        <Close />
      </IconButton>
    </Box>
  );
}

function ManualInputRow({
  handleChange,
  row,
  surveys,
  onDelete,
  onMethodChange,
  onManualValueChanged,
  manualInputValue
}) {
  return (
    <Box display="flex" mb={1}>
      <MethodTypeDropDown value={row.calculationMethod} onChange={onMethodChange} />
      <span className={classNames(css.col, css.col2)} />
      <span className={classNames(css.col, css.col3)} />
      <DipValueInput onChange={onManualValueChanged} value={row.manualInputValue} />
      <IconButton onClick={onDelete}>
        <Close />
      </IconButton>
    </Box>
  );
}

function calculateTregDip({ md, ns, ew }, cl) {
  const closure = Math.atan2(ew, ns);
  const stregdipazm = cl.azm;
  const regazm = toRadians(stregdipazm);
  return (Math.atan(Math.tan(toRadians(cl.dip)) * Math.cos(regazm - closure)) * 180) / Math.PI;
}

function useAverageControlDipOptions(wellId, controlLogs = EMPTY_ARRAY) {
  const wellPlan = useWellPath(wellId);

  const [cl] = controlLogs;

  return useMemo(
    () =>
      cl
        ? wellPlan
            .map(wp => {
              const tregdip = calculateTregDip(wp, cl);
              return { md: wp.md, dip: tregdip };
            })
            .reverse()
        : EMPTY_ARRAY,
    [cl, wellPlan]
  );
}

const getAverageRealDipClosure = memoizeOne((surveys, controlLogs = EMPTY_ARRAY) => {
  const [cl] = controlLogs;

  if (!cl) {
    return EMPTY_ARRAY;
  }

  return surveys.map(s => {
    const tregdip = calculateTregDip(s, cl);
    return {
      md: s.md,
      dip: tregdip
    };
  });
});

const computeFinalDip = memoizeOne((rows, optionsByRowMethod) => {
  return mean(rows, r => {
    if (r.calculationMethod === methodTypes.MANUAL_INPUT) {
      return r.manualInputValue;
    }

    return calculateAverageDip(r.startIndex, r.nrSurveysBack, optionsByRowMethod[r.calculationMethod]);
  });
});

function useOptionsByMethodType() {
  const { wellId } = useWellIdContainer();
  const { surveys } = useSurveysDataContainer();
  const averageSurveysDipOptions = useMemo(() => surveys.reverse(), [surveys]);
  const [controlLogs] = useWellControlLogList(wellId);
  const averageControlDipOptions = useAverageControlDipOptions(wellId, controlLogs);
  const averageRealDipOptions = getAverageRealDipClosure(surveys, controlLogs);
  return useMemo(
    () => ({
      [methodTypes.AVERAGE_DIP]: averageSurveysDipOptions,
      [methodTypes.AVERAGE_CONTROL_DIP_CLOSURE]: averageControlDipOptions,
      [methodTypes.AVERAGE_REAL_DIP_CLOSURE]: averageRealDipOptions
    }),
    [averageSurveysDipOptions, averageControlDipOptions, averageRealDipOptions]
  );
}

function AutoDipSettings({
  dialogProps,
  onClose,
  dispatch,
  rows,
  getOptionsByMethodType,
  finalValue,
  onSaveDip,
  dipMode
}) {
  const updateRow = (row, field, value) => dispatch({ type: "UPDATE_ROW", id: row.id, field, value });
  const handleChangeMethod = row => e => updateRow(row, "calculationMethod", e.target.value);
  const handleStartChange = row => e => updateRow(row, "startIndex", e.target.value);
  const handleNrSurveysBackChange = row => e => updateRow(row, "nrSurveysBack", e.target.value);
  const handleManualInputValueChanged = row => e => updateRow(row, "manualInputValue", e.target.value);
  const handleDeleteRow = row => () => dispatch({ type: "DELETE_ROW", id: row.id });

  function getRowEl(row) {
    switch (row.calculationMethod) {
      case methodTypes.MANUAL_INPUT:
        return (
          <ManualInputRow
            key={row.id}
            row={row}
            onManualValueChanged={handleManualInputValueChanged(row)}
            onDelete={handleDeleteRow(row)}
            onMethodChange={handleChangeMethod(row)}
          />
        );
      case methodTypes.AVERAGE_DIP:
      case methodTypes.AVERAGE_CONTROL_DIP_CLOSURE:
      case methodTypes.AVERAGE_REAL_DIP_CLOSURE:
        const options = getOptionsByMethodType[row.calculationMethod];

        return (
          <AverageDipRow
            key={row.id}
            row={row}
            options={options}
            onNrSurveysBackChange={handleNrSurveysBackChange(row)}
            onDelete={handleDeleteRow(row)}
            onMethodChange={handleChangeMethod(row)}
            onStartChange={handleStartChange(row)}
          />
        );

      default:
        return null;
    }
  }

  return (
    <Dialog classes={{ paper: css.autoDipPaper, root: css.autoDip }} {...dialogProps}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between">
          <span>Calculated Auto-Dip Settings</span>
          <IconButton aria-label="Close" className={css.closeButton} onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent p={1} className="layout vertical space-between">
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle1">
            For each calculation row choose the calculation method, the depth at which to start, and how many surveys
            back to include. If the Manual Input method is chosen, enter the dip value directly.
          </Typography>
          <Box display="flex" className={css.header} mt={2}>
            <ColumnHead className={classNames(css.col, css.col1)}>Calculation Method</ColumnHead>
            <ColumnHead className={classNames(css.col, css.col2)}>Start with MD (Dip)</ColumnHead>
            <ColumnHead className={classNames(css.col, css.col3)}>No. of Surveys Back</ColumnHead>
            <ColumnHead className={classNames(css.col, css.col4)}>Dip Value</ColumnHead>
          </Box>
          <Box display="flex" flexDirection="column">
            {rows.map(getRowEl)}
            <Box display="flex" alignItems="center">
              <IconButton onClick={() => dispatch({ type: "ADD_NEW_ROW" })}>
                <AddCircle />
              </IconButton>
              <Typography variant={"caption"}>Add Calculation Row</Typography>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="baseline">
            <span>Calculated dip value to be auto-applied:</span>
            <Typography color="primary" className={css.finalValue}>
              {finalValue}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              onSaveDip(finalValue);
              onClose();
            }}
          >
            Apply Now
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

const AutoDip = React.memo(
  ({
    onSaveDip,
    applyDisabled,
    dispatch,
    settingsOpened,
    rows,
    dipMode,
    manualValue,
    finalValue,
    valueToApply,
    getOptionsByMethodType
  }) => {
    const toggleSettings = useCallback(() => dispatch({ type: "TOGGLE_SETTINGS" }), [dispatch]);
    return (
      <Box diplay="flex" flexDirection="column">
        <Box display="flex" alignItems="center">
          <Typography className={classNames(css.title, css.autoDipTitle)} variant="subtitle1">
            Auto-Dip
          </Typography>

          <Typography variant="caption">Dip to auto-apply to each new survey</Typography>
        </Box>
        <Box display="flex">
          <Box display="flex" flexDirection="column">
            <Tabs
              value={dipMode}
              indicatorColor="primary"
              centered
              onChange={(_, tab) => {
                dispatch({ type: "CHANGE_DIP_MODE", mode: tab });
              }}
            >
              <Tab label={NORMAL} value={NORMAL} className={css.tab} />
              <Tab label={CALCULATED} value={CALCULATED} className={css.tab} />
            </Tabs>
            {dipMode === NORMAL ? (
              <TextField
                value={manualValue}
                onChange={e => dispatch({ type: "CHANGE_MANUAL_VALUE", manualValue: e.target.value })}
                type="number"
                label={"Value Auto-Applied"}
                className={classNames("hideArrows", css.autoDipInput)}
                margin="dense"
                InputLabelProps={{
                  shrink: true
                }}
              />
            ) : (
              <Box display="flex">
                <TextField
                  value={finalValue}
                  type="number"
                  label={"Value Auto-Applied"}
                  className={classNames("hideArrows", css.autoDipInput)}
                  margin="dense"
                  InputLabelProps={{
                    shrink: true
                  }}
                />

                <IconButton onClick={toggleSettings}>
                  <Tune />
                </IconButton>
              </Box>
            )}
          </Box>

          <Button
            className="self-end"
            variant="outlined"
            color="primary"
            disabled={applyDisabled}
            onClick={() => onSaveDip(valueToApply)}
          >
            Apply Now
          </Button>
        </Box>
        <AutoDipSettings
          onSaveDip={onSaveDip}
          dialogProps={{ open: settingsOpened }}
          onClose={toggleSettings}
          dispatch={dispatch}
          getOptionsByMethodType={getOptionsByMethodType}
          finalValue={finalValue}
          rows={rows}
        />
      </Box>
    );
  }
);

export default function AutoDipContainer() {
  const selectedSegment = useSelectedSegmentState();
  const updateSegments = useUpdateSegmentsByMd();

  const { saveWellLogs } = useSaveWellLogActions();

  const handleApply = useCallback(
    dip => {
      const changes = { [selectedSegment.endmd]: { dip } };
      updateSegments();
      saveWellLogs([selectedSegment], changes);
    },
    [selectedSegment, updateSegments, saveWellLogs]
  );

  const internalState = useRef({ handleApply });

  internalState.current.handleApply = handleApply;

  const handleSaveDip = useCallback(dip => {
    internalState.current.handleApply(dip);
  }, []);

  const [{ dipMode, settingsOpened, rowsById, manualValue }, dispatch] = useReducer(autoDipReducer, initialState);

  const rows = useMemo(() => Object.values(rowsById), [rowsById]);
  const getOptionsByMethodType = useOptionsByMethodType();
  const finalValue = computeFinalDip(rows, getOptionsByMethodType);

  const valueToApply = dipMode === NORMAL ? manualValue : finalValue;
  const applyDisabled = Number.isNaN(parseFloat(valueToApply)) || selectedSegment.sectdip === Number(valueToApply);

  const props = {
    onSaveDip: handleSaveDip,
    applyDisabled,
    dispatch,
    settingsOpened,
    rows,
    dipMode,
    manualValue,
    finalValue,
    valueToApply,
    getOptionsByMethodType
  };
  return <AutoDip {...props} />;
}
