import React, { useState, useReducer, useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import _ from "lodash";

import { calculateProjection } from "../../../../hooks/projectionCalculations";
import SnackbarComponent from "../../../../components/Snackbar";
import { MD_INC_AZ, LAST_DOGLEG } from "../../../../constants/calcMethods";
import {
  MD,
  DL,
  bitContainerPages,
  bitProjectionInitialState,
  ENABLED_FIELDS_DEPTH,
  ENABLED_FIELDS_LAST_DL
} from "../../../../constants/directionalGuidance";
import { useBitProjection } from "../../../../api";
import {
  useSurveysDataContainer,
  useSelectedWellInfoContainer,
  useFormationsDataContainer
} from "../../../App/Containers";
import { useWellLogsContainer } from "../../../ComboDashboard/containers/wellLogs";
import { pageReducer } from "./reducers";
import classes from "./styles.scss";

function Bit({ wellId }) {
  const { updateBitProjection } = useBitProjection();
  const [{ wellInfo }] = useSelectedWellInfoContainer(wellId);
  const propazm = wellInfo ? Number(wellInfo.propazm) : 0;
  const { surveys, refreshSurveys } = useSurveysDataContainer();
  const [, , , { refresh: refreshWellLogs }] = useWellLogsContainer();
  const { refreshFormations } = useFormationsDataContainer();
  const [calculationMethod, setMethod] = useState(MD);
  const method = calculationMethod === MD ? MD_INC_AZ : LAST_DOGLEG;
  const enabledFields = calculationMethod === MD ? ENABLED_FIELDS_DEPTH : ENABLED_FIELDS_LAST_DL;
  const [fieldValues, setFieldValue] = useState(bitProjectionInitialState);
  const [pageSelected, setSelectedPage] = useReducer(pageReducer, 0);
  const [error, setError] = useState("");

  const lastSurvey = useMemo(() => surveys.length && surveys.find(s => s.isLastSurvey), [surveys]);
  const bitProjIndex = useMemo(() => surveys.length && surveys.findIndex(s => s.isBitProj), [surveys]);
  const bitProjection = bitProjIndex > -1 && surveys[bitProjIndex];

  const handleCloseWarning = useCallback(() => setError(""), []);
  const handleSelectMethod = useCallback(e => setMethod(e.target.value), []);
  const handlePageSelect = useCallback(type => setSelectedPage({ type, payload: bitContainerPages.pages.length }), []);

  const handleFieldValueChange = useCallback(
    field => e => {
      const value = Number(e.target.value);
      if (field === "cl" && lastSurvey) {
        setFieldValue(v => ({ ...v, [field]: value, md: value + lastSurvey.md }));
      } else if (field === "md" && lastSurvey) {
        setFieldValue(v => ({ ...v, [field]: value, cl: value - v.pmd }));
      } else {
        setFieldValue(v => ({ ...v, [field]: value }));
      }
    },
    [lastSurvey]
  );

  const handleCalculate = async () => {
    const results = calculateProjection(fieldValues, surveys, bitProjIndex, propazm);

    const basePayload = {
      svycnt: surveys.length,
      svysel: bitProjIndex,
      currid: bitProjection.id
    };
    let payload;
    if (results && typeof results !== "string") {
      payload = {
        ...results,
        ...basePayload
      };
    } else {
      payload = {
        ...fieldValues,
        ...basePayload
      };
      typeof results === "string" && setError(results);
    }

    payload.meth = method;
    delete payload.method;
    delete payload.cl;
    delete payload.ns;
    delete payload.ew;
    delete payload.dl;

    await updateBitProjection(wellId, payload);
    refreshSurveys();
    refreshWellLogs();
    refreshFormations();
  };

  useEffect(() => {
    if (bitProjection && lastSurvey) {
      setFieldValue(v => ({
        ...v,
        bprj_pos_tcl: bitProjection.tcl - bitProjection.tvd,
        bprjpostcl: bitProjection.tcl - bitProjection.tvd,
        md: lastSurvey.md + bitProjection.cl,
        ..._.pick(bitProjection, [
          "cl",
          "inc",
          "azm",
          "tvd",
          "vs",
          "ca",
          "cd",
          "ns",
          "ew",
          "tot",
          "bot",
          "dip",
          "fault"
        ]),
        tpos: bitProjection.tcl - bitProjection.tvd,
        pmd: lastSurvey.md,
        pinc: lastSurvey.inc,
        pazm: lastSurvey.azm,
        ptvd: lastSurvey.tvd,
        pca: lastSurvey.ca,
        pcd: lastSurvey.cd
      }));
    }
  }, [bitProjection, lastSurvey]);

  useEffect(() => {
    if (wellInfo) {
      setFieldValue(v => ({
        ...v,
        autoposdec: wellInfo.autoposdec,
        bitoffset: wellInfo.bitoffset,
        propazm,
        method
      }));
    }
  }, [wellInfo, propazm, method]);

  return (
    <div className={classes.bitContainer}>
      <div className={classes.carousel}>
        {pageSelected > 0 && (
          <IconButton color="primary" onClick={() => handlePageSelect("DECREMENT")}>
            <ChevronLeft />
          </IconButton>
        )}
        {bitContainerPages.pages[pageSelected].map((labels, index) => (
          <div className={classes.kpiColumn} key={index}>
            {labels.map(label => {
              const field = label.toLowerCase();
              return (
                <TextField
                  key={label}
                  label={label}
                  className={classes.textField}
                  value={fieldValues[field]}
                  onChange={handleFieldValueChange(field)}
                  margin="normal"
                  disabled={!enabledFields.includes(label)}
                  type="number"
                />
              );
            })}
          </div>
        ))}
        {pageSelected < bitContainerPages.pages.length - 1 && (
          <IconButton color="primary" onClick={() => handlePageSelect("INCREMENT")}>
            <ChevronRight />
          </IconButton>
        )}
      </div>
      <div className={classes.bitControls}>
        <Select
          value={calculationMethod}
          onChange={handleSelectMethod}
          inputProps={{
            name: "method",
            id: "calc-method"
          }}
        >
          <MenuItem value={MD}>MD, INC, AZM</MenuItem>
          <MenuItem value={DL}>Dogleg</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleCalculate}>
          Calculate
        </Button>
      </div>
      <SnackbarComponent open={!!error} handleClose={handleCloseWarning} variant="error" message={error} />
    </div>
  );
}

Bit.propTypes = {
  wellId: PropTypes.string
};

export default Bit;
