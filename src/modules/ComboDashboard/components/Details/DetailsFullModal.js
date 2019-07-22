import React from "react";
import PropTypes from "prop-types";
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";

import Close from "@material-ui/icons/Close";
import classes from "./Details.scss";
import DetailsTable from ".";

function DetailsFullModal({ handleClose, isVisible }) {
  return (
    <Dialog
      PaperProps={{
        style: {
          maxWidth: "940px"
        }
      }}
      onClose={handleClose}
      maxWidth="md"
      aria-labelledby="customized-dialog-title"
      open={isVisible}
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <span>Surveys in View</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box display="flex" flexDirection="row">
          <Box display="flex" flexDirection="column">
            <DetailsTable showFullTable />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DetailsFullModal.propTypes = {
  handleClose: PropTypes.func,
  isVisible: PropTypes.bool
};

export default DetailsFullModal;
