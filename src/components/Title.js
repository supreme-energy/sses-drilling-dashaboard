import React from "react";
import { Typography, makeStyles, withStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";

const styles = theme => ({
  root: {
    color: theme.palette.sectionTitle.main
  }
});

export default withStyles(styles)(({ classes, ...props }) => (
  <Typography className={classes.root} variant="h6" {...props} gutterBottom />
));
