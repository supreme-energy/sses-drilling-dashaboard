import React, { useState, useCallback } from "react";
import { Paper } from "@material-ui/core";
import ColorPicker from "../../modules/StructuralGuidance/components/ColorPicker";
import css from "./styles.scss";

const ColorPickerBox = React.memo(({ boxProps, handleSave, ...props }) => {
  const [anchorEl, updateAnchorEl] = useState(null);
  const saveCallback = useCallback(
    value => {
      handleSave(value);
      updateAnchorEl(null);
    },
    [updateAnchorEl, handleSave]
  );
  const closeCallback = useCallback(() => updateAnchorEl(null), [updateAnchorEl]);
  const clickCallback = useCallback(e => updateAnchorEl(e.target), [updateAnchorEl]);
  const c = props.color;
  return (
    <Paper {...boxProps}>
      <div
        className={css.colorBox}
        onClick={clickCallback}
        style={{
          backgroundColor: typeof c === "object" ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})` : props.hex
        }}
      />
      <ColorPicker {...props} handleSave={saveCallback} anchorEl={anchorEl} handleClose={closeCallback} />
    </Paper>
  );
});

ColorPickerBox.defaultProps = {
  boxProps: {},
  handleSave: () => {}
};

export default ColorPickerBox;
