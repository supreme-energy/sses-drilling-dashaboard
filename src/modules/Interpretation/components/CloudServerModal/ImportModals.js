import React from "react";
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
import { useManualImport, useCloudImportSurveys } from "../../../../api";
import { REVIEW_MANUAL_IMPORT, SETTINGS, REVIEW_CLEAN_DATA } from "../../../../constants/interpretation";
import classes from "./styles.scss";

export const ManualImportModal = React.memo(({ wellId, handleClose, setView, setFile, file, setErrors }) => {
  const { getFileCheck, uploadFile } = useManualImport();

  const handleImport = async () => {
    const data = new FormData();
    data.append("userfile", file);

    const res = await getFileCheck(wellId, data);
    const json = await res.json();

    const success = json.status === "success";
    const fileName = json.filename;

    if (success) {
      uploadFile(wellId, fileName);
      handleClose();
    } else {
      setErrors(json);
      setView(REVIEW_MANUAL_IMPORT);
    }
  };

  const handleSelectFile = e => {
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
        <input accept=".las" id="manual-import-file" type="file" onChange={handleSelectFile} hidden />
        <label htmlFor="manual-import-file">
          <Button component="span" color="primary" variant="outlined">
            Choose File
          </Button>
        </label>
        <span className={classes.fileName}>{file.name}</span>
      </DialogContent>
      <DialogActions className={classes.importDialogActions}>
        <Button color="primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!file.name} variant="contained" color="primary">
          Import
        </Button>
      </DialogActions>
    </React.Fragment>
  );
});

export const AutoImportModal = React.memo(({ wellId, hasConflict, newSurvey, handleClose, setView, md, inc, azm }) => {
  const { deleteSurveys } = useCloudImportSurveys();

  const openSettings = () => setView(SETTINGS);
  const handleCleanData = async () => {
    await deleteSurveys(wellId);
    setView(REVIEW_CLEAN_DATA);
  };
  const handleCleanHistory = () => setView(REVIEW_CLEAN_DATA);
  const handleSave = () => handleClose();
  return (
    <React.Fragment>
      <DialogTitle className={classes.importDialogTitle}>
        <span>Pull Data Server Auto Importer</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.importDialogContent}>
        {newSurvey && (
          <DialogContentText>
            There is new survey data from the server.
            {!hasConflict && (
              <span>The new data doesn't conflict with data you are modeling and can be safely imported.</span>
            )}
          </DialogContentText>
        )}

        <Box display="flex" flexDirection="row">
          {newSurvey && (
            <div>
              <Typography variant="subtitle1">Server Data Summary</Typography>
              <div>{`MD ${md}`}</div>
              <div>{`INC ${inc}`}</div>
              <div>{`AZM ${azm}`}</div>
            </div>
          )}

          {hasConflict && (
            <div>
              <Typography variant="subtitle1">Clean Up Advice</Typography>
              <DialogContentText>
                The new data conflicts with data you are modeling and it is recommended to automatically clean up the
                modeled data before importing.
              </DialogContentText>
              <Button
                className={classes.notificationButton}
                color="primary"
                variant="contained"
                onClick={handleCleanData}
              >
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
        <Button className={classes.notificationButton} color="primary" onClick={handleCleanHistory}>
          Clean Up History
        </Button>
        <DialogActions className={classes.importDialogActions}>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="outlined" color={hasConflict ? "secondary" : "primary"}>
            {hasConflict ? "Import Anyway" : "Import"}
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
});
