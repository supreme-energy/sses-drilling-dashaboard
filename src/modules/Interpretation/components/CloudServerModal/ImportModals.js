import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import classNames from "classnames";

import classes from "./styles.scss";

export const IMPORT = "import";
export const SETTINGS = "settings";
export const REVIEW = "review";

export function ManualImportModal({ hasConflict, handleClose, setView }) {
  const [file, setFile] = useState({});
  const handleImport = () => setView("REVIEW");
  const handleUpload = e => {
    setFile(e.target.files[0]);
  };
  return (
    <React.Fragment>
      <DialogTitle className={classes.importDialogTitle}>
        <span>Import Survey Data</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.importDialogContent}>
        <DialogContentText>
          Choose a file to import a new survey. You will be warned of any conflicts.
        </DialogContentText>
        <input accept=".las" id="raised-button-file" multiple type="file" onChange={handleUpload} hidden />
        <label htmlFor="raised-button-file">
          <Button className={classes.notificationButton} component="span" color="primary" variant="outlined">
            Choose File
          </Button>
          {file.name}
        </label>
      </DialogContent>
      <DialogActions className={classes.importDialogActions}>
        <Button color="primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className={classNames({ [classes.conflictButton]: hasConflict })}
          onClick={handleImport}
          variant="contained"
          color={hasConflict ? "secondary" : "primary"}
        >
          {hasConflict ? "Overwrite With New Data" : "Import"}
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

export function AutoImportModal({ hasConflict, handleClose, setView, md, inc, azm }) {
  const openSettings = () => setView(SETTINGS);
  const handleSave = () => handleClose();
  return (
    <React.Fragment>
      <DialogTitle className={classes.importDialogTitle}>
        <span>Cloud Server Well Log Updates</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.importDialogContent}>
        <DialogContentText>
          There is new survey data from the server.
          {!hasConflict && (
            <span>The new data doesn't conflict with data you are modeling and can be safely imported.</span>
          )}
        </DialogContentText>

        <Box display="flex" flexDirection="row">
          <div>
            <Typography variant="subtitle1">Server Data Summary</Typography>
            <div>{`MD ${md}`}</div>
            <div>{`INC ${inc}`}</div>
            <div>{`AZM ${azm}`}</div>
          </div>

          {hasConflict && (
            <div>
              <Typography variant="subtitle1">Clean Up Advice</Typography>
              <DialogContentText>
                The new data conflicts with data you are modeling and it is recommended to automatically clean up the
                modeled data for importing.
              </DialogContentText>
              <Button className={classes.notificationButton} color="primary" variant="contained" onClick={openSettings}>
                Clean Up Modeled Data
              </Button>
            </div>
          )}
        </Box>
      </DialogContent>
      <Box display="flex" justifyContent="space-between">
        <Button className={classes.notificationButton} color="primary" onClick={openSettings}>
          Pull/Notification Settings
        </Button>
        <Button className={classes.notificationButton} color="primary" onClick={openSettings}>
          Clean Up History
        </Button>
        <DialogActions className={classes.importDialogActions}>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className={classNames({ [classes.conflictButton]: hasConflict })}
            onClick={handleSave}
            variant="contained"
            color={hasConflict ? "secondary" : "primary"}
          >
            {hasConflict ? "Overwrite With New Data" : "Import"}
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
}
