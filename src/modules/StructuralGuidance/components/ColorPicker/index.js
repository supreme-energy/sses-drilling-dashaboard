import React from "react";
import PropTypes from "prop-types";
import Popover from "@material-ui/core/Popover";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { CustomPicker } from "react-color";
import { Alpha, Hue, Saturation, EditableInput } from "react-color/lib/components/common";
import classes from "./styles.scss";

export const Slider = () => <span className={classes.slider} />;

function ColorPicker({ handleSave, handleClose, onChange, anchorEl, ...props }) {
  const open = Boolean(anchorEl);
  const inputStyles = {
    input: {
      border: "none",
      borderBottom: "1px solid black",
      outline: "none",
      width: 30
    },
    label: {
      fontSize: 12,
      color: "#999"
    }
  };

  const hexInputStyle = {
    ...inputStyles,
    input: {
      ...inputStyles.input,
      width: 100
    }
  };

  const handleSaveColor = () => handleSave(props.hex);

  return (
    <Popover
      className={classes.colorPicker}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left"
      }}
    >
      <div className={classes.saturation}>
        <Saturation {...props} onChange={onChange} />
      </div>
      <Box display="flex">
        <Box display="flex" flexDirection="column">
          <div className={classes.alpha}>
            <Alpha {...props} onChange={onChange} pointer={Slider} />
          </div>
          <div className={classes.hue}>
            <Hue {...props} onChange={onChange} direction={"horizontal"} pointer={Slider} />
          </div>
        </Box>
        <div
          style={{
            width: 30,
            height: 30,
            margin: "10px 10px 0",
            background: props.hex
          }}
        />
      </Box>
      <Box display="flex" justifyContent="space-evenly" p={2}>
        <FormControlLabel
          className={classes.input}
          control={<EditableInput style={hexInputStyle} value={props.hex} onChange={onChange} />}
          label="Hex"
          labelPlacement="top"
        />
        <FormControlLabel
          className={classes.input}
          control={<EditableInput style={inputStyles} value={props.rgb.r} onChange={onChange} />}
          label="R"
          labelPlacement="top"
        />
        <FormControlLabel
          className={classes.input}
          control={<EditableInput style={inputStyles} value={props.rgb.g} onChange={onChange} />}
          label="G"
          labelPlacement="top"
        />
        <FormControlLabel
          className={classes.input}
          control={<EditableInput style={inputStyles} value={props.rgb.b} onChange={onChange} />}
          label="B"
          labelPlacement="top"
        />
        <FormControlLabel
          className={classes.input}
          control={<EditableInput style={inputStyles} value={props.rgb.a} onChange={onChange} />}
          label="A"
          labelPlacement="top"
        />
      </Box>
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button className={classes.button} onClick={handleClose} color="primary">
          Close
        </Button>
        <Button onClick={handleSaveColor} color="primary" variant="contained">
          Apply
        </Button>
      </Box>
    </Popover>
  );
}

ColorPicker.propTypes = {
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  rgb: PropTypes.shape({
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number,
    a: PropTypes.number
  }),
  hex: PropTypes.string,
  onChange: PropTypes.func,
  handleSave: PropTypes.func
};

export default React.memo(CustomPicker(ColorPicker));
