import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Box,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import { useManualImport } from "../../../../api";
import { useFormationsDataContainer, useProjectionsDataContainer } from "../../../App/Containers";
import { useWellLogsContainer } from "../../../ComboDashboard/containers/wellLogs";

import classes from "./styles.scss";
import { useRefreshSurveysAndUpdateSelection } from "../../actions";

const ReviewManualImport = React.memo(({ wellId, handleClose, fileName, setFile, setErrors, errors }) => {
  const { getFileCheck, uploadFile } = useManualImport();
  const { refreshProjections } = useProjectionsDataContainer();
  const [, , , { refresh: refreshWellLogs }] = useWellLogsContainer();
  const { refreshFormations } = useFormationsDataContainer();
  const refreshSurveysAndUpdateSelection = useRefreshSurveysAndUpdateSelection();
  const filePath = errors.filename.substr(0, errors.filename.lastIndexOf("/"));
  const serverFileName = errors.filename.substr(errors.filename.lastIndexOf("/") + 1);
  const errorMsg = errors.results;
  
  const handleImport = async () => {
    const res = await uploadFile(wellId, errors.filename);

    // Clear files if call is successful
    if (res.status === "success") {
      refreshSurveysAndUpdateSelection();
      refreshProjections();
      refreshWellLogs();
      refreshFormations();
      setFile({});
    }
    handleClose();
  };

  const handleCancel = () => handleClose();
  const handleSelectFile = async e => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append("userfile", file);

    const res = await getFileCheck(wellId, data);
    const json = await res.json();

    setFile(file);
    setErrors(json);
  };
  return (
    <React.Fragment>
      <DialogTitle className={classes.notificationDialogTitle}>
        <span>Review Survey Data Import</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.manualReviewContent}>
        <DialogContentText>{`Error uploading ${fileName} as ${serverFileName} in ${filePath}`}</DialogContentText>
        <div className={classes.errorMessages}>
          {errorMsg.map((error, index) => (
            <pre key={index}>{error}</pre>
          ))}
        </div>
      </DialogContent>
      <Box display="flex" justifyContent="space-between">
        <input accept=".las" id="manual-import-file" type="file" onChange={handleSelectFile} hidden />
        <label className={classes.fileUploadButton} htmlFor="manual-import-file">
          <Button color="primary" component="span">
            Choose Another File
          </Button>
        </label>

        <DialogActions className={classes.importDialogActions}>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button className={classes.conflictButton} onClick={handleImport} variant="contained" color="primary">
            Import Anyway
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
});

ReviewManualImport.propTypes = {
  wellId: PropTypes.string,
  handleClose: PropTypes.func,
  fileName: PropTypes.string,
  setFile: PropTypes.func,
  setErrors: PropTypes.func,
  errors: PropTypes.shape({
    filename: PropTypes.string,
    results: PropTypes.arrayOf(PropTypes.string)
  })
};

export default ReviewManualImport;
