import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import classes from "./WelcomeCard.scss";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import ImportInput from "../ImportInput";

export default function NewWellDialog({
  open,
  handleClose,
  wellName,
  handleChange,
  handleSave,
  isImport,
  toggleIsImport,
  onFilesToImportChange
}) {
  const createButton = (
    <Button
      color="primary"
      variant="contained"
      component="span"
      onClick={isImport ? null : handleSave}
      disabled={!wellName}
    >
      Create
    </Button>
  );
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Create A New Well</DialogTitle>
      <DialogContent className={classes.diaglogContent}>
        <DialogContentText>To create a new well, enter the name of the well below.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Well Name"
          value={wellName}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true
          }}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              classes={{ root: classes.checkbox }}
              checked={isImport}
              onChange={() => toggleIsImport()}
              value={isImport}
            />
          }
          label="Import a well set-up file. You'll select a LAS file and map fields
          to pre-populate well information in the system."
        />
      </DialogContent>
      <DialogActions className={classes.newWellDialogActions}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        {isImport ? (
          <ImportInput
            labelProps={{ className: classes.importInputLabel }}
            onChange={e => wellName && onFilesToImportChange(e, wellName)}
            color="primary"
          >
            {createButton}
          </ImportInput>
        ) : (
          createButton
        )}
      </DialogActions>
    </Dialog>
  );
}
