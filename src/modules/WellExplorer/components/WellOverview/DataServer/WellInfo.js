import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import { useWellBoreData, useWellInfo } from "../../../../../api";
import Title from "../../../../../components/Title";
import { wellFields, wellLabels, initialWellState } from "../../../../../constants/dataServer";
import classes from "./styles.scss";

// TODO: Complete Well/WellLog/Well Bore selection when Tyler's endpoint is provided
function WellInfo({ wellId }) {
  const [{ autorc = {}, appInfo = {} }, , , refresh, , updateAppInfo, , updateAutoRc] = useWellInfo(wellId);
  const data = useWellBoreData();
  const [values, setValues] = useState(initialWellState);

  const differenceKey = useMemo(() => {
    if (data && data.length) {
      Object.keys(values).filter(key => {
        if ([wellFields.WELL, wellFields.WELL_LOG, wellFields.WELL_BORE].includes(key)) {
          return values[key] !== data[0][key];
        }
      });
    }
  }, [values, data]);

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

  const onBlurWellbore = useCallback(
    e => {
      if (differenceKey && differenceKey.length) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          // onFieldChange(differenceKey, values[differenceKey], true);
        }
      }
    },
    [differenceKey]
  );

  useEffect(() => {
    if ((autorc, appInfo, data, data.length)) {
      setValues(v => ({
        ...v,
        [wellFields.WELL]: data[0].nameWell,
        [wellFields.WELL_BORE]: data[0].nameWellbore,
        [wellFields.WELL_LOG]: data[0].name,
        [wellFields.START_DEPTH]: autorc.aisd,
        [wellFields.GR_IMPORT]: appInfo.auto_gr_mnemonic
      }));
    }
  }, [autorc, appInfo, data]);

  return (
    <div className={classes.wellInfoContainer}>
      <Title>Server Info</Title>
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
                  onBlur={onBlurWellbore}
                  inputProps={{
                    name: "well",
                    id: "well"
                  }}
                >
                  <MenuItem value="" disabled>
                    Choose Well
                  </MenuItem>
                  {data.map(({ nameWell }) => (
                    <MenuItem key={nameWell} value={nameWell}>
                      {nameWell}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined">Choose By API #</Button>
            </Box>

            <FormControl>
              <InputLabel htmlFor="server-type">{wellLabels.WELL_BORE}</InputLabel>
              <Select
                value={values[wellFields.WELL_BORE]}
                onChange={handleInputChange(wellFields.WELL_BORE)}
                onBlur={onBlurWellbore}
                inputProps={{
                  name: "well_bore",
                  id: "well_bore"
                }}
              >
                <MenuItem value="" disabled>
                  Choose Well Bore
                </MenuItem>
                {data.map(({ nameWellbore }) => (
                  <MenuItem key={nameWellbore} value={nameWellbore}>
                    {nameWellbore}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="server-type">{wellLabels.WELL_LOG}</InputLabel>
              <Select
                value={values[wellFields.WELL_LOG]}
                onChange={handleInputChange(wellFields.WELL_LOG)}
                onBlur={onBlurWellbore}
                inputProps={{
                  name: "well_log",
                  id: "well_log"
                }}
              >
                <MenuItem value="" disabled>
                  Choose Well Log
                </MenuItem>
                {data.map(({ name }) => (
                  <MenuItem key={name} value={name}>
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
