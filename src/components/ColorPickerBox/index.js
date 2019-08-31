import React, { useState } from "react";
import { Paper } from "@material-ui/core";
import ColorPicker from "../../modules/StructuralGuidance/components/ColorPicker";
import css from "./styles.scss";

export default function ColorPickerBox({ boxProps, ...props }) {
  const [anchorEl, updateAnchorEl] = useState(null);
  return (
    <Paper {...boxProps}>
      <div
        className={css.colorBox}
        onClick={e => updateAnchorEl(e.target)}
        style={{
          backgroundColor: props.hex
        }}
      />
      <ColorPicker
        {...props}
        handleSave={value => {
          props.handleSave(value);
          updateAnchorEl(null);
        }}
        anchorEl={anchorEl}
        handleClose={() => updateAnchorEl(null)}
      />
    </Paper>
  );
}

ColorPickerBox.defaultProps = {
  boxProps: {},
  handleSave: () => {}
};
