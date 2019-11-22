import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText
} from "@material-ui/core";

import Close from "@material-ui/icons/Close";
import classes from "../baseModalStyles.scss";
import { useControlLogImport } from "../../api";
import { useControlLogDataContainer, useWellIdContainer } from "../../modules/App/Containers";

function ControlLogImportModal({ handleClose, isVisible }) {
  const { wellId } = useWellIdContainer();
  const { uploadControlLog } = useControlLogImport();
  const [, , , , , { refresh }] = useControlLogDataContainer();
  const [file, setFile] = useState("");
  const [error, setError] = useState("");

  const handleImport = async () => {
    const data = new FormData();
    data.append("userfile", file);

    const res = await uploadControlLog(wellId, data);
    const json = await res.json();
    const success = json.status !== "error";
    if (success) {
      refresh();
      handleClose();
    } else {
      setError(json);
    }
  };

  const handleSelectFile = e => {
    setFile(e.target.files[0]);
  };
  return (
    <Dialog onClose={handleClose} maxWidth={false} aria-labelledby="customized-dialog-title" open={isVisible || false}>
      <DialogTitle className={classes.dialogTitle}>
        <span>Control Log Importer</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.importDialogContent}>
        {error && (
          <DialogContentText className={classes.conflictText}>
            Problem with upload. Server message: {error.message}
          </DialogContentText>
        )}
        <DialogContentText>Choose a file to import a new control log</DialogContentText>
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
    </Dialog>
  );
}

ControlLogImportModal.propTypes = {
  handleClose: PropTypes.func,
  isVisible: PropTypes.bool
};

export default ControlLogImportModal;
