import React, { useMemo, useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import { useWitsWellData, useWitsWellboreData, useWitsWellLogData, useWellInfo } from "../../../../../api";
import Title from "../../../../../components/Title";
import { wellFields, wellLabels, initialWellState } from "../../../../../constants/dataServer";
import classes from "./styles.scss";

function WellInfo({ wellId }) {
  const [
    { autorc = {}, appInfo = {}, witsmlDetails = {} },
    ,
    ,
    refresh,
    ,
    updateAppInfo,
    ,
    updateAutoRc,
    updateWitsmlDetails
  ] = useWellInfo(wellId);
  const { data: wellData, refresh: refreshWell } = useWitsWellData(wellId);
  const { data: wellboreData, refresh: refreshWellbore } = useWitsWellboreData(wellId);
  const { data: wellLogData, refresh: refreshWellLog } = useWitsWellLogData(wellId);
  const [values, setValues] = useState(initialWellState);
  const wellUid = values[wellFields.WELL];
  const wellStateInitialized = useRef(false);

  const differenceKey = useMemo(() => {
    return Object.keys(values).filter(key => {
      if ([wellFields.WELL, wellFields.WELL_LOG, wellFields.WELLBORE].includes(key)) {
        return values[key] !== witsmlDetails[key];
      }
    });
  }, [values, witsmlDetails]);

  const wellboreValues = useMemo(() => wellboreData.filter(wb => wellUid === wb.wellUid), [wellboreData, wellUid]);

  const handleInputChange = id => e => {
    const value = e.target.value;
    setValues(v => ({ ...v, [id]: value }));
  };

  const onFieldChangeAutoRc = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateAutoRc({ wellId, field, value });
      if (shouldRefreshStore) {
        refresh();
      }
    },
    [updateAutoRc, wellId, refresh]
  );

  const onFieldChangeAppInfo = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateAppInfo({ wellId, field, value });
      if (shouldRefreshStore) {
        refresh();
      }
    },
    [updateAppInfo, wellId, refresh]
  );

  const onFieldChangeWitsmlDetails = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateWitsmlDetails({ wellId, field, value });
      if (shouldRefreshStore) {
        refresh();
        refreshWell();
        refreshWellbore();
        refreshWellLog();
      }
    },
    [updateWitsmlDetails, wellId, refresh, refreshWell, refreshWellbore, refreshWellLog]
  );

  const onBlurAppInfo = useCallback(
    e => {
      if (appInfo[wellFields.GR_IMPORT] !== values[wellFields.GR_IMPORT]) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onFieldChangeAppInfo(wellFields.GR_IMPORT, values[wellFields.GR_IMPORT], true);
        }
      }
    },
    [values, appInfo, onFieldChangeAppInfo]
  );

  const onBlurAutoRc = useCallback(
    e => {
      if (autorc[wellFields.START_DEPTH] !== values[wellFields.START_DEPTH]) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onFieldChangeAutoRc(wellFields.START_DEPTH, values[wellFields.START_DEPTH], true);
        }
      }
    },
    [values, autorc, onFieldChangeAutoRc]
  );

  const onBlurWitsmlDetails = useCallback(
    e => {
      if (differenceKey && differenceKey.length) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          differenceKey.map(key => onFieldChangeWitsmlDetails(key, values[key], true));
        }
      }
    },
    [differenceKey, onFieldChangeWitsmlDetails, values]
  );

  useEffect(() => {
    if (!_.isEmpty(witsmlDetails) && !wellStateInitialized.current) {
      setValues(v => ({
        ...v,
        [wellFields.WELL]: witsmlDetails[wellFields.WELL],
        [wellFields.WELLBORE]: witsmlDetails[wellFields.WELLBORE],
        [wellFields.WELL_LOG]: witsmlDetails[wellFields.WELL_LOG],
        [wellFields.START_DEPTH]: autorc[wellFields.START_DEPTH],
        [wellFields.GR_IMPORT]: appInfo[wellFields.GR_IMPORT]
      }));
      wellStateInitialized.current = true;
    }
  }, [autorc, appInfo, witsmlDetails]);

  useEffect(() => {
    const wellboreHasChanged = wellboreValues.length && wellboreValues[0].uid !== values[wellFields.WELLBORE];
    if (values[wellFields.WELL] && wellboreHasChanged) {
      setValues(v => ({
        ...v,
        [wellFields.WELLBORE]: wellboreValues[0].uid
      }));
    }
  }, [values, wellboreValues]);

  return (
    <div className={classes.wellInfoContainer}>
      <Title>Well Info</Title>
      <form>
        <div className={classes.formContainer}>
          <div className={classes.textInputContainer}>
            <TextField
              className={classes.extendedTextField}
              label={wellLabels.START_DEPTH}
              value={values[wellFields.START_DEPTH]}
              onChange={handleInputChange(wellFields.START_DEPTH)}
              margin="normal"
              onBlur={onBlurAutoRc}
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              className={classes.extendedTextField}
              label={wellLabels.GR_IMPORT}
              value={values[wellFields.GR_IMPORT]}
              onChange={handleInputChange(wellFields.GR_IMPORT)}
              margin="normal"
              onBlur={onBlurAppInfo}
              InputLabelProps={{
                shrink: true
              }}
            />
          </div>
          <Box display="flex" flexDirection="column">
            <Box display="flex">
              <FormControl className={classes.selectWellDropdown}>
                <InputLabel htmlFor="well">{wellLabels.WELL}</InputLabel>
                <Select
                  value={values[wellFields.WELL]}
                  onChange={handleInputChange(wellFields.WELL)}
                  onBlur={onBlurWitsmlDetails}
                  inputProps={{
                    name: wellLabels.WELL,
                    id: wellFields.WELL
                  }}
                >
                  <MenuItem value="" disabled>
                    Choose Well
                  </MenuItem>
                  {wellData.map(({ name, uid }, index) => (
                    <MenuItem key={name + uid + index} value={uid}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl>
              <InputLabel htmlFor="wellbore">{wellLabels.WELLBORE}</InputLabel>
              <Select
                value={values[wellFields.WELLBORE]}
                onChange={handleInputChange(wellFields.WELLBORE)}
                onBlur={onBlurWitsmlDetails}
                inputProps={{
                  name: "wellbore",
                  id: "wellbore"
                }}
              >
                <MenuItem value="" disabled>
                  Choose Well Bore
                </MenuItem>
                {wellboreValues.map(({ name, uid }, index) => (
                  <MenuItem key={name + uid + index} value={uid}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="well_log">{wellLabels.WELL_LOG}</InputLabel>
              <Select
                value={values[wellFields.WELL_LOG]}
                onChange={handleInputChange(wellFields.WELL_LOG)}
                onBlur={onBlurWitsmlDetails}
                inputProps={{
                  name: wellLabels.WELL_LOG,
                  id: wellFields.WELL_LOG
                }}
              >
                <MenuItem value="" disabled>
                  Choose Well Log
                </MenuItem>
                {wellLogData.map(({ name, uid }, index) => (
                  <MenuItem key={name + uid + index} value={uid}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>
      </form>
    </div>
  );
}

WellInfo.propTypes = {
  wellId: PropTypes.string
};

export default WellInfo;
