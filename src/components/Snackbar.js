import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
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
    backgroundColor: theme.palette.success.main
  },
  error: {
    backgroundColor: theme.palette.warning.main
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: theme.palette.yellow.main
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

function SnackbarComponent({ className, variant, message, open, handleClose, duration = 6000 }) {
  const classes = useStyles();
  const Icon = variantIcon[variant];

  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={handleClose}>
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
  );
}

SnackbarComponent.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  variant: PropTypes.oneOf(["error", "info", "success", "warning"]).isRequired,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  duration: PropTypes.number
};

export default SnackbarComponent;
