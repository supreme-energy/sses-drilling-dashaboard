import React from "react";
import { Typography, withStyles } from "@material-ui/core";

const styles = theme => ({
  root: {
    color: theme.palette.sectionTitle.main
  }
});

export default withStyles(styles)(({ classes, ...props }) => (
  <Typography className={classes.root} variant="h6" {...props} gutterBottom />
));
