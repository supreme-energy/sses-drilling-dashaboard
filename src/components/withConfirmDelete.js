import React, { useState } from "react";
import hoc from "react-powertools/hoc";
import { Popover, Button, Typography } from "@material-ui/core";

export default hoc(Component => ({ onConfirm, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);
  return (
    <React.Fragment>
      <Component {...props} onClick={handleClick} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Button
          variant="text"
          onClick={() => {
            handleClose();
            onConfirm && onConfirm();
          }}
        >
          <Typography variant="button" color="error">
            Confirm Delete
          </Typography>
        </Button>
      </Popover>
    </React.Fragment>
  );
});
