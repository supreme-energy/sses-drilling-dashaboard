import React from "react";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    top: 56,
    backgroundColor: "white",
  },
};

const StyledModal = withStyles(styles, { name: 'MuiModal' })(Modal);

const WellImporterModal = ({ children, ...rest }) => {
  return (
    <StyledModal {...rest}>
      <React.Fragment>
        {children}
      </React.Fragment>
    </StyledModal>
  );
};

WellImporterModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export default WellImporterModal;
