import React, { useState, useCallback, useReducer, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import _ from "lodash";

import { calculateSlide, sortById, determineIncAzm } from "./calculations";
import SnackbarComponent from "../../../../components/Snackbar";
import {
  PA1,
  PA2,
  projectToPlanState,
  projectionPages,
  ENABLED_FIELDS_PROJECTION
} from "../../../../constants/directionalGuidance";
import { MD_INC_AZ } from "../../../../constants/calcMethods";
import { useProjectionToPlan } from "../../../../api";
import {
  useSurveysDataContainer,
  useSelectedWellInfoContainer,
  useProjectionsDataContainer
} from "../../../App/Containers";
import { pageReducer } from "./reducers";
import classes from "./styles.scss";

function ProjectionToPlan({ wellId }) {
  const { data, refresh, updateProjectionToPlan } = useProjectionToPlan(wellId);

  const [{ wellInfo }] = useSelectedWellInfoContainer(wellId);
  const propazm = wellInfo ? Number(wellInfo.propazm) : 0;
  const { surveys } = useSurveysDataContainer();
  const { refreshProjections } = useProjectionsDataContainer();
  const projections = useMemo(() => data.slice().sort(sortById), [data]);
  const [fieldValues, setFieldValue] = useState(projectToPlanState);
  const [pageSelected, setSelectedPage] = useReducer(pageReducer, 0);
  const [selectedStation, setSelectedStation] = useState(PA1);
  const [error, setError] = useState("");

  const bitProjIndex = useMemo(() => surveys.length && surveys.findIndex(s => s.isBitProj), [surveys]);
  const bitProjection = surveys[bitProjIndex];
  const surveyBeforeBit = surveys[bitProjIndex - 1];

  const firstProjection = projections && projections.length && projections[0];
  const secondProjection = firstProjection && projections[1];

  const handleCloseWarning = () => setError("");
  const handleSelectStation = useCallback(
    e => {
      const value = e.target.value;
      const { azm, inc } = determineIncAzm(firstProjection, secondProjection, bitProjection, value);
      setFieldValue(v => ({ ...v, inc, azm }));
      setSelectedStation(value);
    },
    [firstProjection, secondProjection, bitProjection]
  );
  const handleFieldValueChange = field => e => {
    const value = Number(e.target.value);
    setFieldValue(v => ({ ...v, [field]: value }));
  };
  const handlePageSelect = useCallback(type => setSelectedPage({ type, payload: projectionPages.pages.length }), []);
  const handleCalculate = async () => {
    const { inc, azm } = fieldValues;
    if (inc > 180.0 || inc < 0 || azm > 360.0 || azm < 0) {
      return;
    }

    const results = calculateSlide(fieldValues, propazm, bitProjection, surveyBeforeBit, data);
    // if (results && typeof results !== "string") {
    setFieldValue(v => ({ ...v, ...results }));

    const payload = { ...fieldValues, ...results };
    // Set values for Payload
    payload.calctype = selectedStation.toLowerCase();
    payload.meth = payload.method;

    // Delete unused fields
    delete payload.method;

    await updateProjectionToPlan(wellId, payload);
    refresh();
    refreshProjections();
  };

  useEffect(() => {
    if (surveys && surveys.length && projections && projections.length) {
      const { azm: tazm, inc: tinc } = determineIncAzm(
        firstProjection,
        secondProjection,
        bitProjection,
        selectedStation
      );
      setFieldValue(v => ({
        ...v,
        method: MD_INC_AZ,
        svycnt: surveys.length,
        svysel: bitProjIndex,
        tpos: bitProjection.tot - bitProjection.tvd,
        inc: tinc,
        azm: tazm,
        tinc,
        tazm,
        ..._.pick(surveys[surveys.length - 1], ["md", "tvd", "vs", "ca", "cd", "tot", "dip", "fault"]),
        pmd: bitProjection.md,
        pinc: bitProjection.inc,
        pazm: bitProjection.azm,
        ptvd: bitProjection.tvd,
        pca: bitProjection.ca,
        pcd: bitProjection.cd
      }));
    }
  }, [bitProjection, bitProjIndex, firstProjection, secondProjection, selectedStation, surveys, projections]);

  useEffect(() => {
    if (wellInfo) {
      setFieldValue(v => ({
        ...v,
        ..._.pick(wellInfo, ["bitoffset", "motoryield"]),
        propazm
      }));
    }
  }, [wellInfo, propazm]);

  return (
    <div className={classes.bitContainer}>
      <div className={classes.carousel}>
        {pageSelected > 0 && (
          <IconButton color="primary" onClick={() => handlePageSelect("DECREMENT")}>
            <ChevronLeft />
          </IconButton>
        )}
        {projectionPages.pages[pageSelected].map((labels, index) => (
          <div className={classes.kpiColumn} key={index}>
            {labels.map(label => {
              const field = label.toLowerCase().replace(/\s/g, "");
              return (
                <TextField
                  key={label}
                  label={label}
                  className={classes.textField}
                  value={fieldValues[field]}
                  onChange={handleFieldValueChange(field)}
                  margin="normal"
                  disabled={!ENABLED_FIELDS_PROJECTION.includes(label)}
                  type="number"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              );
            })}
          </div>
        ))}
        {pageSelected < projectionPages.pages.length - 1 && (
          <IconButton color="primary" onClick={() => handlePageSelect("INCREMENT")}>
            <ChevronRight />
          </IconButton>
        )}
      </div>
      <div className={classes.bitControls}>
        <Select
          value={selectedStation}
          onChange={handleSelectStation}
          inputProps={{
            name: "station",
            id: "selected-station"
          }}
        >
          <MenuItem value={PA1}>{PA1}</MenuItem>
          <MenuItem value={PA2}>{PA2}</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleCalculate}>
          Calculate
        </Button>
      </div>
      <SnackbarComponent open={!!error} handleClose={handleCloseWarning} variant="error" message={error} />
    </div>
  );
}

ProjectionToPlan.propTypes = {
  wellId: PropTypes.string
};

export default ProjectionToPlan;
