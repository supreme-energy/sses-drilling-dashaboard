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
import classNames from "classnames";
import { useSurveysDataContainer, useFormationsDataContainer } from "../../../App/Containers";
import { useManualImport, useCloudImportSurveys } from "../../../../api";
import { REVIEW, MANUAL, SETTINGS, AUTO } from "../../../../constants/interpretation";
import classes from "./styles.scss";
import { useWellLogsContainer } from "../../../ComboDashboard/containers/wellLogs";

export const ManualImportModal = React.memo(({ wellId, handleClose, setView, setFile, file, setErrors }) => {
  const { getFileCheck, uploadFile } = useManualImport();
  const { refreshSurveys } = useSurveysDataContainer();
  const [, , , { refresh: refreshWellLogs }] = useWellLogsContainer();
  const { refreshFormations } = useFormationsDataContainer();

  const handleImport = async () => {
    const data = new FormData();
    data.append("userfile", file);

    const res = await getFileCheck(wellId, data);
    const json = await res.json();

    const success = json.status === "success";
    const fileName = json.filename;

    if (success) {
      await uploadFile(wellId, fileName);
      refreshSurveys();
      refreshWellLogs();
      refreshFormations();
      handleClose();
    } else {
      setErrors(json);
      setView({ type: REVIEW, payload: MANUAL });
    }
  };

  const handleSelectFile = e => {
    console.log("e.target.files[0]", e.target.files[0]);
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

export const AutoImportModal = React.memo(
  ({ wellId, hasConflict, newSurvey, handleClose, setView, refreshCloudServer, md, inc, azm }) => {
    const { importNewSurvey, deleteSurveys } = useCloudImportSurveys();
    const { refreshSurveys } = useSurveysDataContainer();

    const handleCleanData = async () => {
      await deleteSurveys(wellId);
      await refreshCloudServer();
      setView({ type: REVIEW, payload: AUTO });
    };

    const handleImport = async () => {
      await importNewSurvey(wellId);
      const res = await refreshCloudServer();
      await refreshSurveys();
      if (!res.next_survey) {
        handleClose();
      }
    };

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
              <Box className={classes.newSurveyContainer} display="flex" flexDirection="column" flex={1}>
                <Typography variant="subtitle1">Server Data Summary</Typography>
                <div>
                  MD <span>{md}</span>
                </div>
                <div>
                  INC <span>{inc}</span>
                </div>
                <div>
                  AZM <span>{azm}</span>
                </div>
              </Box>
            )}

            {hasConflict && (
              <Box display="flex" flexDirection="column" flex={3}>
                <Typography variant="subtitle1">Clean Up Advice</Typography>
                <DialogContentText>
                  The new data conflicts with data you are modeling and it is recommended to automatically clean up the
                  modeled data before importing.
                </DialogContentText>
                <Box display="flex">
                  <Button
                    className={classes.cleanUpDataButton}
                    color="primary"
                    variant="contained"
                    onClick={handleCleanData}
                  >
                    Clean Up Modeled Data
                  </Button>
                  <Button
                    className={classes.notificationButton}
                    color="primary"
                    onClick={() => setView({ type: REVIEW, payload: AUTO })}
                  >
                    Clean Up History
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Box display="flex" justifyContent="space-between">
          <Button
            className={classes.notificationButton}
            color="primary"
            onClick={() => setView({ type: SETTINGS, payload: AUTO })}
          >
            Pull/Notification Settings
          </Button>
          <DialogActions className={classes.importDialogActions}>
            <Button color="primary" onClick={handleClose}>
              Cancel
            </Button>
            {newSurvey && (
              <Button
                className={classNames({ [classes.conflictButtonOutlined]: hasConflict })}
                onClick={handleImport}
                variant="outlined"
                color={hasConflict ? "secondary" : "primary"}
              >
                {hasConflict ? "Import Anyway" : "Import"}
              </Button>
            )}
          </DialogActions>
        </Box>
      </React.Fragment>
    );
  }
);
