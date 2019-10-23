import React from "react";
import addCircleSVG from "../../../../assets/addCircle.svg";
import { IconButton, Typography } from "@material-ui/core";
import classNames from "classnames";

export default function AddButton({ className, ...props }) {
  return (
    <div {...props} className={classNames("layout horizontal align-center", className)}>
      <IconButton aria-label="Add">
        <img src={addCircleSVG} width="22" height="22" />
      </IconButton>
      <Typography variant="caption">Add Project-Ahead</Typography>
    </div>
  );
}
