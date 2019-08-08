import React from "react";
import PropTypes from "prop-types";
import { Popover, Button } from "@material-ui/core";
import { CustomPicker } from "react-color";
const { Alpha, Hue, Saturation, EditableInput } = require("react-color/lib/components/common");

// TODO: Build Color Picker with MUI Style
function ColorPicker({ setPicker, color, handleClose, hex, onChange, anchorEl, ...props }) {
  const open = Boolean(anchorEl);

  const inputStyles = {
    input: {
      border: "none",
      outline: "none",
      width: "30px"
    },
    label: {
      fontSize: "12px",
      color: "#999"
    }
  };

  const hexInputStyle = {
    input: {
      ...inputStyles.input,
      width: "100px"
    },
    ...inputStyles
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left"
      }}
    >
      <div style={{ height: 200, width: "100%", position: "relative" }}>
        <Saturation {...props} onChange={onChange} />
      </div>
      <div style={{ height: 10, width: 200, position: "relative" }}>
        <Alpha {...props} onChange={onChange} />
      </div>
      <div style={{ height: 10, width: 200, position: "relative" }}>
        <Hue {...props} onChange={onChange} direction={"horizontal" || "vertical"} />
      </div>
      <div
        style={{
          width: 54,
          height: 38,
          background: hex
        }}
      />
      <div style={{ display: "flex" }}>
        <EditableInput style={hexInputStyle} label="hex" value={hex} onChange={onChange} />
        <EditableInput style={inputStyles} label="r" value={props.rgb.r} onChange={onChange} />
        <EditableInput style={inputStyles} label="g" value={props.rgb.g} onChange={onChange} />
        <EditableInput style={inputStyles} label="b" value={props.rgb.b} onChange={onChange} />
        <EditableInput style={inputStyles} label="a" value={props.rgb.a} onChange={onChange} />
      </div>
      {/* <Checkboard size={12} white="#fff" grey="#333" /> */}
      <Button onClick={handleClose} color="primary">
        Apply
      </Button>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </Popover>
  );
}

ColorPicker.propTypes = {
  setPicker: PropTypes.func,
  color: PropTypes.string,
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  rgb: PropTypes.shape({
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number,
    a: PropTypes.number
  }),
  hex: PropTypes.string,
  onChange: PropTypes.func
};

export default CustomPicker(ColorPicker);
