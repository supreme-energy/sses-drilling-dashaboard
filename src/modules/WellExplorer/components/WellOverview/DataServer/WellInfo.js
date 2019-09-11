import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import _ from "lodash";

import { useSelectedWellInfoContainer } from "../../../../App/Containers";
import Title from "../../../../../components/Title";
import { wellFields, wellLabels, connectionTypes, initialWellState } from "../../../../../constants/dataServer";
import classes from "./styles.scss";

function WellInfo({ wellId }) {
  const [{ autorc, appInfo }, , , refresh, , , , updateAutoRc] = useSelectedWellInfoContainer(wellId);
  const [values, setValues] = useState(initialWellState);

  const differenceKey = useMemo(() => autorc && _.filter(values, (value, key) => value !== autorc[key])[0], [
    values,
    autorc
  ]);

  const handleInputChange = id => e => {
    const value = e.target.value;
    setValues(v => ({ ...v, [id]: value }));
  };
  const onFieldChange = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateAutoRc({ wellId, field, value });
      if (shouldRefreshStore) {
        refresh();
      }
    },
    [updateAutoRc, wellId, refresh]
  );

  const onBlur = useCallback(
    e => {
      if (differenceKey && differenceKey.length) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onFieldChange(differenceKey, values[differenceKey], true);
        }
      }
    },
    [differenceKey, values, onFieldChange]
  );

  useEffect(() => {
    if ((autorc, appInfo)) {
      setValues(v => ({
        ...v,
        [wellFields.START_DEPTH]: autorc.aisd,
        [wellFields.GR_IMPORT]: appInfo.auto_gr_mnemonic
      }));
    }
  }, [autorc, appInfo]);

  return (
    <div className={classes.serverInfoContainer}>
      <Title>Server Info</Title>
      <form>
        <div className={classes.formContainer}>
          <FormControl className={classes.extendedTextField}>
            <InputLabel htmlFor="well">{wellFields.WELL}</InputLabel>
            <Select
              value={values[wellFields.WELL]}
              onChange={handleInputChange(wellFields.WELL)}
              onBlur={onBlur}
              inputProps={{
                name: "well",
                id: "well"
              }}
            >
              {_.map(connectionTypes, (value, key) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.extendedTextField}>
            <InputLabel htmlFor="server-type">{wellFields.WELL_BORE}</InputLabel>
            <Select
              value={values[wellFields.WELL_BORE]}
              onChange={handleInputChange(wellFields.WELL_BORE)}
              onBlur={onBlur}
              inputProps={{
                name: "well_bore",
                id: "well_bore"
              }}
            >
              {_.map(connectionTypes, (value, key) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.extendedTextField}>
            <InputLabel htmlFor="server-type">{wellFields.WELL_LOG}</InputLabel>
            <Select
              value={values[wellFields.WELL_LOG]}
              onChange={handleInputChange(wellFields.WELL_LOG)}
              onBlur={onBlur}
              inputProps={{
                name: "well_log",
                id: "well_log"
              }}
            >
              {_.map(connectionTypes, (value, key) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className={classes.textInputContainer}>
            <TextField
              className={classes.extendedTextField}
              label={wellLabels.START_DEPTH}
              value={values[wellFields.START_DEPTH]}
              onChange={handleInputChange(wellFields.START_DEPTH)}
              margin="normal"
              onBlur={onBlur}
            />
            <TextField
              className={classes.extendedTextField}
              label={wellLabels.GR_IMPORT}
              value={values[wellFields.GR_IMPORT]}
              onChange={handleInputChange(wellFields.GR_IMPORT)}
              margin="normal"
              onBlur={onBlur}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

WellInfo.propTypes = {
  wellId: PropTypes.string
};

export default WellInfo;
