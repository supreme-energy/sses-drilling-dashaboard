import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import classes from "./WelcomeCard.scss";

export default function NewWellDialog({ open, handleClose, wellName, handleChange, handleSave }) {
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Create A New Well</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions className={classes.newWellDialogActions}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
