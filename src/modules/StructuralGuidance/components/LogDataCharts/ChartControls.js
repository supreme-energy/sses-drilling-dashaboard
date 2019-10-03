import React, { useCallback } from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import MoreVert from "@material-ui/icons/MoreVert";
import ArrowBack from "@material-ui/icons/ArrowBack";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import Refresh from "@material-ui/icons/Refresh";
import LogPlotIcon from "../../../../assets/logPlot.svg";
import classes from "./styles.scss";

const ChartControls = React.memo(
  ({ isEditingScale, currentLogs, handleOpenMenu, handleOpenSettings, handleArrowForward, handleArrowBack }) => {
    return (
      <React.Fragment>
        {isEditingScale && currentLogs.length > 1 && (
          <Box display="flex" flexDirection="column" justifyContent="space-around">
            <IconButton onClick={handleArrowBack}>
              <ArrowBack />
            </IconButton>
            <IconButton onClick={handleArrowForward}>
              <ArrowForward />
            </IconButton>
          </Box>
        )}
        {!isEditingScale && (
          <Box display="flex" flexDirection="column" justifyContent="space-around">
            <IconButton className={classes.moreVerticalMenu} color="secondary" onClick={handleOpenSettings}>
              <MoreVert />
            </IconButton>
            <IconButton color="secondary" onClick={handleOpenMenu}>
              <img src={LogPlotIcon} className={classes.icon} />
            </IconButton>
          </Box>
        )}
      </React.Fragment>
    );
  }
);

ChartControls.propTypes = {
  isEditingScale: PropTypes.bool,
  handleOpenMenu: PropTypes.func,
  handleOpenSettings: PropTypes.func,
  handleArrowBack: PropTypes.func,
  handleArrowForward: PropTypes.func,
  currentLogs: PropTypes.arrayOf(PropTypes.string)
};

export default ChartControls;

export const BiasControls = React.memo(
  ({ isEditingScale, setScale, logInfo, handleReset, handleSave, handleClose }) => {
    const prevScale = logInfo && logInfo.prevScale;
    const currScale = logInfo && logInfo.currScale;
    const hasScaleChanged = JSON.stringify(prevScale) !== JSON.stringify(currScale);

    const handleSetBias = useCallback(
      e => {
        const value = Number(e.target.value);
        setScale(currScale.scale, value);
      },
      [currScale, setScale]
    );

    const handleSetScale = useCallback(
      e => {
        const value = Number(e.target.value);
        setScale(value, currScale.bias);
      },
      [currScale, setScale]
    );

    return (
      <React.Fragment>
        {isEditingScale && currScale && (
          <Box display="flex" p={1}>
            <Box display="flex" flexDirection="column">
              <Box display="flex" flexDirection="row">
                <TextField
                  className={classes.textField}
                  value={currScale.bias}
                  onChange={handleSetBias}
                  type="number"
                  label="Bias"
                  margin="dense"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <TextField
                  className={classes.textField}
                  value={currScale.scale}
                  onChange={handleSetScale}
                  type="number"
                  label="Scale"
                  margin="dense"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={handleReset} disabled={!hasScaleChanged}>
                  <Refresh />
                </IconButton>
                <IconButton onClick={handleSave} disabled={!hasScaleChanged}>
                  <Check />
                </IconButton>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </React.Fragment>
    );
  }
);

BiasControls.propTypes = {
  isEditingScale: PropTypes.bool,
  handleClose: PropTypes.func,
  handleReset: PropTypes.func,
  handleSave: PropTypes.func
};
