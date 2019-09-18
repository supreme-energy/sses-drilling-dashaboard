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
import classes from "./WellPlanImporter.scss";
import { useWellPlanImport } from "../../api";
import { useCrossSectionData, useWellIdContainer } from "../../modules/App/Containers";

function WellPlanImporterModal({ handleClose, isVisible }) {
  const { wellId } = useWellIdContainer();
  const { uploadWellPlan } = useWellPlanImport();
  const { refreshWellPlan } = useCrossSectionData();
  const [file, setFile] = useState("");

  const handleImport = async () => {
    const data = new FormData();
    data.append("userfile", file);

    await uploadWellPlan(wellId, data);
    refreshWellPlan();
    handleClose();
  };

  const handleSelectFile = e => {
    setFile(e.target.files[0]);
  };
  return (
    <Dialog onClose={handleClose} maxWidth={false} aria-labelledby="customized-dialog-title" open={isVisible}>
      <DialogTitle className={classes.dialogTitle}>
        <span>Well Plan Importer</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.importDialogContent}>
        <DialogContentText>Choose a file to import a new well plan</DialogContentText>
        <input accept=".csv" id="manual-import-file" type="file" onChange={handleSelectFile} hidden />
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

WellPlanImporterModal.propTypes = {
  handleClose: PropTypes.func,
  isVisible: PropTypes.bool
};

export default WellPlanImporterModal;
