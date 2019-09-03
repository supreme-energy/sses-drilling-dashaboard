import React from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import MoreVert from "@material-ui/icons/MoreVert";
import ArrowBack from "@material-ui/icons/ArrowBack";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import Refresh from "@material-ui/icons/Refresh";
import _ from "lodash";
import LogPlotIcon from "../../../../assets/logPlot.svg";
import classes from "./styles.scss";

function ChartControls({
  isEditingScale,
  view,
  selectedLogs,
  currentLogs,
  handleOpenMenu,
  handleOpenSettings,
  handleArrowForward,
  handleArrowBack,
  handleReset,
  handleSave,
  handleClose,
  children
}) {
  const prevScale = _.get(selectedLogs, `[${view}].prevScale`);
  const currScale = _.get(selectedLogs, `[${view}].currScale`);
  const hasScaleChanged = JSON.stringify(prevScale) !== JSON.stringify(currScale);

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
      {children}
      {isEditingScale && (
        <Box display="flex" p={1}>
          <Box display="flex" flexDirection="column" p={1}>
            <Box display="flex">
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

ChartControls.propTypes = {
  isEditingScale: PropTypes.bool,
  view: PropTypes.string,
  selectedLogs: PropTypes.object,
  handleOpenMenu: PropTypes.func,
  handleOpenSettings: PropTypes.func,
  handleArrowBack: PropTypes.func,
  handleArrowForward: PropTypes.func,
  handleClose: PropTypes.func,
  handleReset: PropTypes.func,
  handleSave: PropTypes.func,
  currentLogs: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node
};

export default ChartControls;
