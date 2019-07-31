import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classNames";
import Button from "@material-ui/core/Button";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import { amber, green } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles } from "@material-ui/core/styles";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const useStyles = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}));

function SnackbarComponent({ className, variant, message }) {
  const classes = useStyles();
  const Icon = variantIcon[variant];
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  function handleClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  }

  return (
    <div>
      <Button variant="outlined" onClick={handleClick}>
        Open Snackbar
      </Button>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <SnackbarContent
          className={classNames(classes[variant], className)}
          aria-describedby="snackbar"
          message={
            <span id="snackbar" className={classes.message}>
              <Icon className={classNames(classes.icon, classes.iconVariant)} />
              {message}
            </span>
          }
          action={[
            <IconButton key="close" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon className={classes.icon} />
            </IconButton>
          ]}
        />
      </Snackbar>
    </div>
  );
}

SnackbarComponent.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  variant: PropTypes.oneOf(["error", "info", "success", "warning"]).isRequired
};

export default SnackbarComponent;
