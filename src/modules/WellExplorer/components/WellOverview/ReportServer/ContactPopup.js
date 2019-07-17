import React, { useCallback, useReducer } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import classNames from "classnames";

import { stateReducer } from "./reducer";
import classes from "./styles.scss";

const VIEW_REPORTS = {
  "Combo Dashboard": false,
  "Structural Guidance": true,
  "Drilling Analytics": false,
  "Directional Guidance": true,
  "Key Performance Indicator": true,
  "Survey Sheet": true,
  "Lateral Plot (Only)": true,
  "Horizontal Plot (Only)": false
};

const DATA_REPORTS = {
  "LAS Data": true,
  '1" MD Logs': true,
  '2" MD Logs': true,
  '5" MD Logs': false,
  '1" TVD Logs': true,
  '2" TVD Logs': false,
  '5" TVD Logs': true
};

function ContactPopup({ handleInputChange, handleClose, values, isVisible, isEditing }) {
  const type = isEditing ? "Edit " : "Add ";
  const [allReports, setAllReports] = useReducer(a => !a, false);
  const [reports, setReport] = useReducer(stateReducer, { ...VIEW_REPORTS, ...DATA_REPORTS });
  const isChecked = value => (!isEditing ? false : allReports || value);

  const handleAllReports = useCallback(() => setAllReports(), []);
  const handleReportChange = useCallback(e => setReport({ [e.target.value]: e.target.checked }), []);
  const handleSave = useCallback(() => handleClose(), [handleClose]);

  return (
    <Dialog
      PaperProps={{
        style: {
          maxWidth: "700px"
        }
      }}
      onClose={handleClose}
      maxWidth="md"
      aria-labelledby="customized-dialog-title"
      open={isVisible}
      fullWidth
    >
      <DialogTitle className={classes.contactDialogTitle}>
        <span>{`${type} Contact`}</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.contactDialogContent}>
        <Box className={classes.popupInputRow} display="flex" flexDirection="row" flex={1} justifyContent="start">
          <TextField
            id="personnel"
            className={classes.textField}
            label={"Personnel"}
            value={values.personnel}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
          />
          <TextField
            id="name"
            className={classes.textField}
            label={"Name"}
            value={values.name}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
          />
        </Box>
        <Box className={classes.popupInputRow} display="flex" flexDirection="row" flex={1} justifyContent="start">
          <TextField
            id="email_address"
            className={classes.textField}
            label={"Email Address"}
            value={values.email_address}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
          />
          <TextField
            id="phone"
            className={classes.textField}
            label={"Phone"}
            value={values.phone}
            onChange={handleInputChange}
            margin="normal"
            helperText="ex: 123-456-7890"
            fullWidth
          />
        </Box>

        <Typography className={classes.reportTitle} variant="h6" gutterBottom>
          Report Assignments
        </Typography>
        <Box display="flex" flexDirection="row" flex={1} justifyContent="space-between">
          <DialogContentText>Select reports that this contact will receive via email.</DialogContentText>
          <div className={classNames(classes.switchComponent, classes.allReportsButton)}>
            <span>All Reports</span>
            <Switch color="primary" checked={allReports} onChange={handleAllReports} />
          </div>
        </Box>
        <Box display="flex" flexDirection="row" flex={1} p={1}>
          <Box display="flex" flexDirection="column" flex={1} p={1}>
            {Object.keys(VIEW_REPORTS).map(key => (
              <div key={key} className={classes.switchComponent}>
                <span>{key}</span>
                <Switch color="primary" value={key} checked={isChecked(reports[key])} onChange={handleReportChange} />
              </div>
            ))}
          </Box>
          <Box display="flex" flexDirection="column" flex={1} p={1}>
            {Object.keys(DATA_REPORTS).map(key => (
              <div key={key} className={classes.switchComponent}>
                <span>{key}</span>
                <Switch color="primary" value={key} checked={isChecked(reports[key])} onChange={handleReportChange} />
              </div>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ContactPopup.propTypes = {
  handleInputChange: PropTypes.func,
  handleClose: PropTypes.func,
  values: PropTypes.object,
  isVisible: PropTypes.bool,
  isEditing: PropTypes.bool
};

export default ContactPopup;
