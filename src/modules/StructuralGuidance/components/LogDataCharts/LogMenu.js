import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Menu from "@material-ui/core/Menu";
import LogPlotIcon from "../../../../assets/logPlot.svg";
import _ from "lodash";
import classes from "./styles.scss";

function LogMenu({ menuItems, selectedGraphs, setSelectedGraph, handleClose, anchorEl, availableGraphs }) {
  const handleCheckbox = name => event => {
    // Limit to 4 checks (i.e. graphs)
    const count = _.reduce(selectedGraphs, (result, value) => (value.checked ? (result += 1) : result), 0);
    const selectedGraph = availableGraphs.filter(({ label }) => label === name)[0];

    if (count >= 4) {
      setSelectedGraph({ ...selectedGraphs, [name]: { color: selectedGraph.color, checked: false } });
    } else {
      setSelectedGraph({
        ...selectedGraphs,
        [name]: { color: selectedGraph.color, checked: event.target.checked }
      });
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
                  checked={_.get(selectedGraphs, `[${graph}].checked`, false)}
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
  handleClose: PropTypes.func,
  availableGraphs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      color: PropTypes.color
    })
  )
};

export default LogMenu;
