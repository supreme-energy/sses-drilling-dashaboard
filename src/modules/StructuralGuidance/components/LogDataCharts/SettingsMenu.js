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
  ListItemIcon
} from "@material-ui/core";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import ColorPicker from "./ColorPicker";
import DataTable from "./DataTable";
import ScalePlotIcon from "../../../../assets/scalePlot.svg";
import TableChartIcon from "../../../../assets/tableChart.svg";

import classes from "./styles.scss";

import { MD, VS } from "../../../../constants/structuralGuidance";

function SettingsMenu({ isVisible, view, setMenu, handleRemoveGraph, graph, data }) {
  const [color, setPickerColor] = useState("#7F7F7F");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDataTableVisible, handleDataTable] = useState(false);

  const handleColorChange = ({ hex }) => {
    setPickerColor(hex);
  };

  const handleCloseModal = () => {
    setMenu(d => {
      return { ...d, isSettingsVisible: false };
    });
  };

  const handleArrowClick = () =>
    setMenu(d => {
      return { ...d, settingsView: view === MD ? VS : MD };
    });

  const handleOpenPicker = event => {
    const open = Boolean(anchorEl);
    setAnchorEl(!open ? event.currentTarget : null);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleRemoveGraph(graph);
  };

  const handleOpenDataTable = () => {
    handleDataTable(true);
  };

  const handleCloseDataTable = () => {
    handleDataTable(false);
  };

  return (
    <Dialog onClose={handleCloseModal} open={isVisible}>
      <DialogTitle className={classes.dialogTitle}>
        <IconButton aria-label="arrow-back" onClick={handleArrowClick}>
          <ArrowBack />
        </IconButton>
        <span>{view}</span>
        <IconButton aria-label="arrow-forward" onClick={handleArrowClick}>
          <ArrowForward />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <List>
          <ListItem button onClick={handleOpenPicker}>
            <ListItemIcon>
              <div style={{ height: 30, width: 30, backgroundColor: color }} />
            </ListItemIcon>
            <ListItemText primary="Edit Style" />
          </ListItem>
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <img src={ScalePlotIcon} className={classes.icon} />
            </ListItemIcon>
            <ListItemText primary="Edit Bias and Scale" />
          </ListItem>
          <ListItem button onClick={handleOpenDataTable}>
            <ListItemIcon>
              <img src={TableChartIcon} className={classes.icon} />
            </ListItemIcon>
            <ListItemText primary="DataTable" />
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
        color={color}
        setPicker={setPickerColor}
        handleClose={handleClosePicker}
        anchorEl={anchorEl}
        onChangeComplete={handleColorChange}
      />
      <DataTable isVisible={isDataTableVisible} handleClose={handleCloseDataTable} data={data} graph={graph} />
    </Dialog>
  );
}

SettingsMenu.propTypes = {
  isVisible: PropTypes.bool,
  graph: PropTypes.string,
  view: PropTypes.string,
  setMenu: PropTypes.func,
  handleRemoveGraph: PropTypes.func,
  data: PropTypes.array
};

export default SettingsMenu;
