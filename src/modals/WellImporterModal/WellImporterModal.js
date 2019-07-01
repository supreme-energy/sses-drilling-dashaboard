import React from "react";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";

const WellImporterModal = ({ children, className, ...rest }) => {
  return (
    <Modal {...rest} className={className} style={{ top: 56, backgroundColor: "white" }}>
      <React.Fragment>{children}</React.Fragment>
    </Modal>
  );
};

WellImporterModal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  className: PropTypes.string
};

export default WellImporterModal;
