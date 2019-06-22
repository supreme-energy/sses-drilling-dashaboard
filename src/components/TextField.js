import React from "react";
import { TextField, makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    backgroundColor: "white"
  },
  cssUnderline: theme => ({
    "&:after": {
      borderBottomColor: theme.palette.primary.main,
      borderWidth: 2
    },
    "&:before": {
      borderColor: "lightgray",
      borderWidth: 1
    }
  }),
  helperTextRoot: theme => ({
    color: theme.palette.primary.main
  }),
  icon: theme => ({
    color: theme.palette.primary.light
  })
});

const StyledTextField = ({ ...props }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <TextField
      {...props}
      FormHelperTextProps={{
        ...props.FormHelperTextProps,
        classes: {
          root: classes.helperTextRoot
        }
      }}
      InputProps={{
        ...props.InputProps,
        classes: {
          root: classes.root,
          underline: classes.cssUnderline
        }
      }}
    />
  );
};

StyledTextField.defaultProps = {
  InputProps: {},
  FormHelperTextProps: {}
};

export default StyledTextField;
