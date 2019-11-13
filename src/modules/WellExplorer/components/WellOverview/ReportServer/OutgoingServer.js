import React, { useCallback, useReducer, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";

import { useWellInfo } from "../../../../../api";
import { stateReducer } from "./reducer";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";

const initialState = {
  smtp_login: "",
  smtp_password: "",
  smtp_server: "",
  smtp_from: ""
};

function OutgoingServer({ wellId }) {
  const [data, , , refreshFetchStore, updateEmail] = useWellInfo(wellId);
  const emailInfo = data.emailInfo || {};
  const [smtpInput, setSmtpInput] = useReducer(stateReducer, initialState);

  const differenceKey = useMemo(() => Object.keys(smtpInput).filter(k => smtpInput[k] !== emailInfo[k]), [
    emailInfo,
    smtpInput
  ]);

  const handleChange = e => setSmtpInput({ [e.target.id]: e.target.value });

  const onFieldChange = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateEmail({ wellId, field, value });
      if (shouldRefreshStore) {
        refreshFetchStore();
      }
    },
    [updateEmail, wellId, refreshFetchStore]
  );

  const onBlur = useCallback(
    e => {
      if (differenceKey.length) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onFieldChange(differenceKey, smtpInput[differenceKey[0]], true);
        }
      }
    },
    [onFieldChange, smtpInput, differenceKey]
  );

  useEffect(() => {
    setSmtpInput(emailInfo);
  }, [emailInfo]);

  useEffect(() => {
    window.addEventListener("beforeunload", onBlur);
    return () => window.removeEventListener("beforeunload", onBlur);
  });

  return (
    <div>
      <Title>Outgoing Mail Server (SMTP)</Title>
      <form>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <TextField
            id="smtp_login"
            label="Email Address"
            className={classes.textField}
            value={smtpInput.smtp_login}
            onChange={handleChange}
            margin="normal"
            onBlur={onBlur}
          />
          <TextField
            id="smtp_password"
            label="Password"
            className={classes.textField}
            value={smtpInput.smtp_password}
            onChange={handleChange}
            margin="normal"
            type="password"
            onBlur={onBlur}
          />
          <TextField
            id="smtp_server"
            label="Host Name"
            className={classes.textField}
            value={smtpInput.smtp_server}
            onChange={handleChange}
            margin="normal"
            onBlur={onBlur}
          />
          <TextField
            id="smtp_from"
            label="Reply to Email Address"
            className={classes.textField}
            value={smtpInput.smtp_from}
            onChange={handleChange}
            margin="normal"
            onBlur={onBlur}
          />
        </Box>
      </form>
    </div>
  );
}

OutgoingServer.propTypes = {
  wellId: PropTypes.string
};

export default OutgoingServer;
