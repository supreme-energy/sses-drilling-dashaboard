import React, { useReducer } from "react";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";
import SnackbarContentWrapper from "../../components/SnackBarContentWrapper";
import { Snackbar } from "@material-ui/core";
import { createContainer } from "unstated-next";
import { useWellImporterContainer } from "./WellImporter";

const initialState = {
  isLoading: false,
  isSaved: false,
  error: null
};

function useWellImporterSave() {
  return useReducer((state, action) => {
    switch (action.type) {
      case "LOADING_START":
        return {
          ...state,
          isLoading: true
        };
      case "SAVE_SUCCESS":
        return {
          ...state,
          isSaved: true,
          isLoading: false,
          error: null
        };

      case "SAVE_ERROR":
        return {
          ...state,
          isSaved: false,
          isLoading: false,
          error: action.error
        };
      case "RESET":
        return {
          ...state,
          isSaved: false,
          error: null,
          isLoading: false
        };
    }
  }, initialState);
}

export const { Provider: WellImporterSaveProvider, useContainer: useWellImporterSaveContainer } = createContainer(
  useWellImporterSave
);

const WellImporterModal = ({ children, className, ...rest }) => {
  const [{ isSaved, error }, dispatch] = useWellImporterSaveContainer();
  const [{ pendingCreateWell }] = useWellImporterContainer();

  function onClose() {
    dispatch({ type: "RESET" });
  }

  return (
    <React.Fragment>
      <Modal {...rest} className={className} style={{ top: 56, backgroundColor: "white" }}>
        <React.Fragment>{children}</React.Fragment>
      </Modal>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={isSaved || error}
        onClose={onClose}
        autoHideDuration={6000}
      >
        {error ? (
          <SnackbarContentWrapper variant="error" message={error} />
        ) : (
          <SnackbarContentWrapper
            variant="success"
            message={`Well ${pendingCreateWell ? "created" : "updated"}  successfuly!`}
          />
        )}
      </Snackbar>
    </React.Fragment>
  );
};

WellImporterModal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  className: PropTypes.string
};

export default WellImporterModal;
