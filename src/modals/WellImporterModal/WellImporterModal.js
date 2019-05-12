import { Button, DialogActions } from "@material-ui/core";
import React from "react";
import Modal from "@material-ui/core/Modal";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    top: 56,
    backgroundColor: "white",
  },
};

const StyledModal = withStyles(styles, { name: 'MuiModal' })(Modal);

const WellImporterModal = ({ onClose, children, ...rest }) => {
  console.log(children);
  return (
    <StyledModal {...rest} onClose={onClose}>
      <React.Fragment>
        {children}
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </React.Fragment>
    </StyledModal>
  );
};

export default WellImporterModal;
