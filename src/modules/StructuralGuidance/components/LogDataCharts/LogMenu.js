import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Menu from "@material-ui/core/Menu";
import LogPlotIcon from "../../../../assets/logPlot.svg";
import _ from "lodash";
import classes from "./styles.scss";

function LogMenu({ menuItems, selectedGraphs, setSelectedGraph, handleClose, anchorEl }) {
  const handleCheckbox = name => event => {
    // Limit to 4 checks (i.e. graphs)
    const count = _.reduce(selectedGraphs, (result, value) => (value ? (result += 1) : result), 0);
    if (count >= 4) {
      setSelectedGraph({ ...selectedGraphs, [name]: false });
    } else {
      setSelectedGraph({ ...selectedGraphs, [name]: event.target.checked });
    }
  };

  return (
    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
      <FormGroup className={classes.logFormGroup}>
        {menuItems.map(graph => (
          <FormControlLabel
            key={graph}
            control={
              <React.Fragment>
                <img src={LogPlotIcon} className={classes.icon} />
                <span className={classes.logMenuLabel}>{graph}</span>
                <Checkbox
                  className={classes.logMenuCheckboxes}
                  checked={selectedGraphs[graph] || false}
                  onChange={handleCheckbox(graph)}
                  value={graph}
                  color="secondary"
                />
              </React.Fragment>
            }
          />
        ))}
      </FormGroup>
    </Menu>
  );
}

LogMenu.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.string),
  selectedGraphs: PropTypes.object,
  setSelectedGraph: PropTypes.func,
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func
};

export default LogMenu;
