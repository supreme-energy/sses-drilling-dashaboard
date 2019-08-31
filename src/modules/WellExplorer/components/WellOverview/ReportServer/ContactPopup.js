import React from "react";
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

import { PERSONNEL, EMAIL, NAME, PHONE } from "../../../../../constants/reportServer";
import classes from "./styles.scss";

function ContactPopup({
  reports,
  handleAllReports,
  handleReportChange,
  handleSave,
  handleInputChange,
  handleClose,
  values,
  isVisible,
  isEditing
}) {
  const type = isEditing ? "Edit " : "Add ";

  // TODO: Integrate BE for Reports
  const isChecked = value => reports.allReportsSelected || value;
  const reportKeys = Object.keys(reports);
  const viewReports = reportKeys.slice(0, 8);
  const dataReports = reportKeys.slice(8, reportKeys.length - 1);

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
            className={classes.textField}
            label={PERSONNEL.label}
            value={values.cat}
            onChange={handleInputChange(PERSONNEL.field)}
            margin="normal"
            fullWidth
          />
          <TextField
            className={classes.textField}
            label={NAME.label}
            value={values.name}
            onChange={handleInputChange(NAME.field)}
            margin="normal"
            fullWidth
          />
        </Box>
        <Box className={classes.popupInputRow} display="flex" flexDirection="row" flex={1} justifyContent="start">
          <TextField
            className={classes.textField}
            label={EMAIL.label}
            value={values.email}
            onChange={handleInputChange(EMAIL.field)}
            margin="normal"
            fullWidth
          />
          <TextField
            className={classes.textField}
            label={PHONE.label}
            value={values.phone}
            onChange={handleInputChange(PHONE.field)}
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
            <Switch color="primary" checked={reports.allReportsSelected} onChange={handleAllReports} />
          </div>
        </Box>
        <Box display="flex" flexDirection="row" flex={1} p={1}>
          <Box display="flex" flexDirection="column" flex={1} p={1}>
            {viewReports.map(key => (
              <div key={key} className={classes.switchComponent}>
                <span>{key}</span>
                <Switch color="primary" value={key} checked={isChecked(reports[key])} onChange={handleReportChange} />
              </div>
            ))}
          </Box>
          <Box display="flex" flexDirection="column" flex={1} p={1}>
            {dataReports.map(key => (
              <div key={key} className={classes.switchComponent}>
                <span>{key}</span>
                <Switch color="primary" value={key} checked={isChecked(reports[key])} onChange={handleReportChange} />
              </div>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.contactDialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ContactPopup.propTypes = {
  handleSave: PropTypes.func,
  handleInputChange: PropTypes.func,
  handleClose: PropTypes.func,
  values: PropTypes.object,
  isVisible: PropTypes.bool,
  isEditing: PropTypes.bool,
  reports: PropTypes.object,
  handleAllReports: PropTypes.func,
  handleReportChange: PropTypes.func
};

export default ContactPopup;
