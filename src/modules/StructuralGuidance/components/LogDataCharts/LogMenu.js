import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Menu from "@material-ui/core/Menu";
import LogPlotIcon from "../../../../assets/logPlot.svg";
import _ from "lodash";
import classes from "./styles.scss";

const LogMenu = React.memo(
  ({ menuItems, logId, selectedLogs, setSelectedLog, handleClose, anchorEl, availableLogs }) => {
    const handleCheckbox = name => event => {
      // Limit to 4 checks (i.e. logs)
      const count = _.reduce(selectedLogs[logId], (result, value) => (value.checked ? (result += 1) : result), 0);
      const { color, scale, bias } = availableLogs.filter(({ label }) => label === name)[0];

      if (count >= 4) {
        setSelectedLog({
          type: "ADD_LOG",
          payload: {
            logId,
            name,
            [name]: {
              prevScale: { scale, bias },
              currScale: { scale, bias },
              color,
              checked: false
            }
          }
        });
      } else {
        setSelectedLog({
          type: "ADD_LOG",
          payload: {
            logId,
            name,
            [name]: {
              color,
              prevScale: { scale, bias },
              currScale: { scale, bias },
              checked: event.target.checked
            }
          }
        });
      }
    };

    return (
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <FormGroup className={classes.logFormGroup}>
          {menuItems.map(log => (
            <FormControlLabel
              key={log}
              control={
                <React.Fragment>
                  <img src={LogPlotIcon} className={classes.icon} />
                  <span className={classes.logMenuLabel}>{log}</span>
                  <Checkbox
                    className={classes.logMenuCheckboxes}
                    checked={_.get(selectedLogs, `[${logId}][${log}].checked`, false)}
                    onChange={handleCheckbox(log)}
                    value={log}
                    color="secondary"
                  />
                </React.Fragment>
              }
            />
          ))}
          {!menuItems.length && <FormControlLabel control={<div />} label={"No data currently available"} />}
        </FormGroup>
      </Menu>
    );
  }
);

LogMenu.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.string),
  selectedLogs: PropTypes.object,
  setSelectedLog: PropTypes.func,
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  availableLogs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      color: PropTypes.color
    })
  ),
  logId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default LogMenu;
