import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemText,
  List,
  ListItemIcon,
  Paper
} from "@material-ui/core";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import _ from "lodash";

import { useAdditionalDataLog, useAdditionalDataLogsList } from "../../../../api";
import { useWellIdContainer } from "../../../App/Containers";
import ColorPicker from "../ColorPicker";
import ScalePlotIcon from "../../../../assets/scalePlot.svg";

import classes from "./styles.scss";

const SettingsMenu = React.memo(
  ({
    isVisible,
    view,
    setMenu,
    handleRemoveChart,
    log,
    setSelectedLog,
    selectedLogs,
    setEditingScale,
    handleArrowBack,
    handleArrowForward
  }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { wellId } = useWellIdContainer();
    const { dataBySection = {} } = useAdditionalDataLogsList(wellId);
    const { updateAdditionalLogDetails } = useAdditionalDataLog(wellId);

    const handleSaveColor = hex => {
      const id = dataBySection[view].id;
      const color = hex.substring(1);
      setSelectedLog({ ...selectedLogs, [view]: { ...selectedLogs[view], color } });
      updateAdditionalLogDetails(wellId, { id, color });
      handleClosePicker();
    };

    const handleCloseSettings = () => {
      setMenu(d => {
        return { ...d, isSettingsVisible: false };
      });
    };

    const handleOpenPicker = event => {
      const open = Boolean(anchorEl);
      setAnchorEl(!open ? event.currentTarget : null);
    };

    const handleClosePicker = () => {
      setAnchorEl(null);
      handleCloseSettings();
    };

    const handleEditScale = () => {
      setEditingScale(true);
      handleCloseSettings();
    };

    const handleDelete = () => {
      handleRemoveChart(log);
      handleCloseSettings();
    };

    return (
      <Dialog onClose={handleCloseSettings} open={isVisible}>
        <DialogTitle className={classes.dialogTitle}>
          <IconButton aria-label="arrow-back" onClick={handleArrowBack}>
            <ArrowBack />
          </IconButton>
          <span>{view}</span>
          <IconButton aria-label="arrow-forward" onClick={handleArrowForward}>
            <ArrowForward />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.settingsDialogContent}>
          <List>
            <ListItem button onClick={handleOpenPicker}>
              <ListItemIcon>
                <Paper>
                  <div
                    style={{
                      height: 25,
                      width: 25,
                      backgroundColor: `#${_.get(selectedLogs, `[${view}].color`)}`
                    }}
                  />
                </Paper>
              </ListItemIcon>
              <ListItemText primary="Edit Style" />
            </ListItem>
            <ListItem button onClick={handleEditScale}>
              <ListItemIcon>
                <img src={ScalePlotIcon} className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary="Edit Bias and Scale" />
            </ListItem>
            <ListItem button onClick={handleDelete}>
              <ListItemIcon>
                <RemoveCircle />
              </ListItemIcon>
              <ListItemText primary="Remove Chart" />
            </ListItem>
          </List>
        </DialogContent>

        <ColorPicker
          color={_.get(selectedLogs, `[${view}].color`)}
          handleClose={handleClosePicker}
          handleSave={handleSaveColor}
          anchorEl={anchorEl}
        />
      </Dialog>
    );
  }
);

SettingsMenu.propTypes = {
  isVisible: PropTypes.bool,
  log: PropTypes.string,
  view: PropTypes.string,
  setMenu: PropTypes.func,
  handleRemoveChart: PropTypes.func,
  setEditingScale: PropTypes.func,
  setSelectedLog: PropTypes.func,
  selectedLogs: PropTypes.object,
  handleArrowBack: PropTypes.func,
  handleArrowForward: PropTypes.func
};

export default SettingsMenu;
