import React, { forwardRef } from "react";
import { makeStyles } from "@material-ui/styles";
import classNames from "classnames";

const useStyles = makeStyles({
  root: {
    position: "relative",
    "& > canvas": {
      position: "absolute"
    }
  }
});

export default forwardRef((props, ref) => {
  const classes = useStyles();
  return <div ref={ref} className={classNames(classes.root, props.className)} />;
});
