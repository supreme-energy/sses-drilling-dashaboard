import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import _ from "lodash";

import { useSelectedWellInfoContainer } from "../../../../App/Containers";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";

const fields = {
  USERNAME: "username",
  PASSWORD: "password",
  ENDPOINT: "host",
  TYPE: "connection_type"
};
const connectionTypes = {
  POLARIS: "polaris"
};
const initialServerState = {
  [fields.USERNAME]: "",
  [fields.PASSWORD]: "",
  [fields.ENDPOINT]: "",
  [fields.TYPE]: ""
};
function ServerInfo({ wellId }) {
  const [{ autorc }, , , refresh, , , , updateAutoRc] = useSelectedWellInfoContainer(wellId);

  const [values, setValues] = useState(initialServerState);

  const differenceKey = useMemo(() => autorc && Object.keys(values).filter(k => values[k] !== autorc[k]), [
    values,
    autorc
  ]);

  const handleInputChange = id => e => setValues(v => ({ ...v, [id]: e.target.value }));

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
          onFieldChange(differenceKey, values[differenceKey[0]], true);
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

  console.log(values, autorc);

  return (
    <div className={classes.reportMailingListContainer}>
      <Title>Report Mailing List</Title>
      <form>
        <Select
          value={values[fields.TYPE]}
          onChange={handleInputChange(fields.TYPE)}
          inputProps={{
            name: "type",
            id: "server-type"
          }}
        >
          {Object.keys(connectionTypes).map(type => (
            <MenuItem value={type}>type</MenuItem>
          ))}
        </Select>
        <TextField
          label={fields.USERNAME}
          value={values[fields.USERNAME]}
          onChange={handleInputChange(fields.USERNAME)}
          margin="normal"
          onBlur={onBlur}
        />
        <TextField
          label={fields.PASSWORD}
          value={values[fields.PASSWORD]}
          onChange={handleInputChange(fields.PASSWORD)}
          margin="normal"
          onBlur={onBlur}
          type="password"
        />
        <TextField
          label={fields.ENDPOINT}
          value={values[fields.ENDPOINT]}
          onChange={handleInputChange(fields.ENDPOINT)}
          margin="normal"
        />
      </form>
    </div>
  );
}

ServerInfo.propTypes = {
  wellId: PropTypes.string
};

export default ServerInfo;
