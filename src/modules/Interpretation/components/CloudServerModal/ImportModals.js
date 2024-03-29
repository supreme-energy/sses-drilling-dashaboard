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
import { useFormationsDataContainer, useProjectionsDataContainer, useSelectedWellInfoContainer } from "../../../App/Containers";
import { useManualImport, useCloudImportSurveys } from "../../../../api";
import { REVIEW, MANUAL, SETTINGS, AUTO, LASUPLOAD } from "../../../../constants/interpretation";
import classes from "./styles.scss";
import { useWellLogsContainer } from "../../../ComboDashboard/containers/wellLogs";
import BitMethod from "./BitMethod";
import { useRefreshSurveysAndUpdateSelection } from "../../actions";
import LastSurveyStats from "../LastSurveyStats";

export const ManualImportModal = React.memo(({ wellId, handleClose, setView, setFile, file, setErrors }) => {
  const { getFileCheck, uploadFile } = useManualImport();

  const [, , , { refresh: refreshWellLogs }] = useWellLogsContainer();
  const { refreshFormations } = useFormationsDataContainer();
  const { refreshProjections } = useProjectionsDataContainer();
  const refreshSurveysAndUpdateSelection = useRefreshSurveysAndUpdateSelection();
  
  const handleImport = async () => {
    const data = new FormData();
    data.append("userfile", file);

    const res = await getFileCheck(wellId, data);
    const json = await res.json();

    const success = json.status === "success";
    const fileName = json.filename;

    if (success) {
      await uploadFile(wellId, fileName);

      refreshSurveysAndUpdateSelection();
      refreshProjections();
      refreshWellLogs();
      refreshFormations();
      handleClose();
    } else {
      setErrors(json);
      setView({ type: REVIEW, payload: MANUAL });
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
        <div className="layout vertical">
          <Box display="flex" flexDirection="column" mb={3}>
            <LastSurveyStats mb={3} />
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
          </Box>

          <BitMethod />
        </div>
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
    const [, , , { refresh: refreshWellLogs }] = useWellLogsContainer();
    const { refreshFormations } = useFormationsDataContainer();
    const { refreshProjections } = useProjectionsDataContainer();
    const refreshSurveysAndUpdateSelection = useRefreshSurveysAndUpdateSelection();
    const [
	    { appInfo, wellInfo, isCloudServerEnabled, isLasFileDataSource },
	    ,
	    ,
	    refreshFetchStore,
	    ,
	    updateAppInfo,
	    updateAutoImport
	  ] = useSelectedWellInfoContainer(wellId);
    const handleCleanData = async () => {
      await deleteSurveys(wellId);
      await refreshCloudServer();
      setView({ type: REVIEW, payload: AUTO });
    };

    const handleImport = async () => {
      await importNewSurvey(wellId);
      const res = await refreshCloudServer();
      refreshSurveysAndUpdateSelection();
      refreshProjections();
      refreshWellLogs();
      refreshFormations();
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

          <Box display="flex" flexDirection="row" mb={2}>
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
          <BitMethod />
        </DialogContent>
        <Box display="flex" justifyContent="space-between">
          { !isLasFileDataSource && (
          <Button
            className={classes.notificationButton}
            color="primary"
            onClick={() => setView({ type: SETTINGS, payload: AUTO })}
          >
            Pull/Notification Settings
          </Button>
          )}
          { isLasFileDataSource && (
	          <Button
	            className={classes.notificationButton}
	            color="primary"
	            onClick={() => setView({ type: LASUPLOAD, payload: AUTO })}
	          >
	            Las File Uploads
	          </Button>
          )}
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
