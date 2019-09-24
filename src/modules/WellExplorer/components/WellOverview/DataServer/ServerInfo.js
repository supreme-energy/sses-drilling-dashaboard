import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import _ from "lodash";

import { useWellInfo } from "../../../../../api";
import Title from "../../../../../components/Title";
import { serverFields, serverLabels, connectionTypes, initialServerState } from "../../../../../constants/dataServer";
import classes from "./styles.scss";

function ServerInfo({ wellId }) {
  const [{ autorc = {} }, , , refresh, , , , updateAutoRc] = useWellInfo(wellId);
  const [values, setValues] = useState(initialServerState);

  const differenceKey = useMemo(() => autorc && Object.keys(values).filter(key => values[key] !== autorc[key])[0], [
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
    if (autorc) {
      setValues(v => ({
        ...v,
        ..._.pick(autorc, Object.keys(initialServerState))
      }));
    }
  }, [autorc]);

  return (
    <div className={classes.serverInfoContainer}>
      <Title>Server Info</Title>
      <form>
        <div className={classes.formContainer}>
          <FormControl className={classes.textField}>
            <InputLabel htmlFor="server-type">Server Type</InputLabel>
            <Select
              value={values[serverFields.TYPE]}
              onChange={handleInputChange(serverFields.TYPE)}
              onBlur={onBlur}
              inputProps={{
                name: "type",
                id: "server-type"
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
              className={classes.textField}
              label={serverLabels.USERNAME}
              value={values[serverFields.USERNAME]}
              onChange={handleInputChange(serverFields.USERNAME)}
              margin="normal"
              onBlur={onBlur}
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              className={classes.textField}
              label={serverLabels.PASSWORD}
              value={values[serverFields.PASSWORD]}
              onChange={handleInputChange(serverFields.PASSWORD)}
              margin="normal"
              onBlur={onBlur}
              type="password"
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              className={classes.extendedTextField}
              label={serverLabels.ENDPOINT}
              value={values[serverFields.ENDPOINT]}
              onChange={handleInputChange(serverFields.ENDPOINT)}
              margin="normal"
              onBlur={onBlur}
              InputLabelProps={{
                shrink: true
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

ServerInfo.propTypes = {
  wellId: PropTypes.string
};

export default ServerInfo;
