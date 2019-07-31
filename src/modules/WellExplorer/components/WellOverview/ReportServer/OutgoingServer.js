import React, { useCallback, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { TextField } from "@material-ui/core";
import Box from "@material-ui/core/Box";

import { stateReducer } from "./reducer";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";

const initialState = {
  smtp_login: "",
  smtp_password: "",
  smtp_server: "",
  smtp_from: ""
};

function OutgoingServer({ emailInfo, onChange }) {
  const [smtpInput, setSmtpInput] = useReducer(stateReducer, initialState);

  useEffect(() => {
    setSmtpInput(emailInfo);
  }, [emailInfo]);

  const handleChange = useCallback(e => setSmtpInput({ [e.target.id]: e.target.value }), []);

  const onBlur = useCallback(
    e => {
      e.returnValue = "Changes you made may not be saved.";
      if (!document.activeElement.id) {
        const differenceKey = Object.keys(smtpInput).filter(k => smtpInput[k] !== emailInfo[k]);
        if (differenceKey.length) {
          onChange(differenceKey, smtpInput[differenceKey]);
        }
      }
    },
    [onChange, smtpInput, emailInfo]
  );

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
  emailInfo: PropTypes.object,
  onChange: PropTypes.func
};

export default OutgoingServer;
